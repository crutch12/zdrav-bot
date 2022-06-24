import * as admin from 'firebase-admin';
import { Chat, Polis, Subscription } from '../lib/chat';
import { AuthResult } from '../types/Auth';
import * as functions from 'firebase-functions';

const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://zdrav-mosreg-test-default-rtdb.europe-west1.firebasedatabase.app',
});

const db = admin.firestore();

db.settings({ ignoreUndefinedProperties: true });

export const getChats = async (): Promise<Chat[]> => {
  const chatsRaw = await db
    .collection('chats')
    .get()
    .then((snapshot) => snapshot.docs);

  const chats = chatsRaw.map((chatRaw) => new Chat(Number(chatRaw.id), chatRaw.data()));

  return chats;
};

export const createChat = (userId: number) => {
  const docRef = db.collection('chats').doc(`${userId}`);
  return docRef.set({}).then((result) => {
    return new Chat(userId, {});
  });
};

export const getChat = async (userId) => {
  const docRef = db.collection('chats').doc(`${userId}`);
  const data = await docRef.get();
  if (!data.exists) {
    return null;
  }
  const value = data.data();
  const chat = new Chat(userId, {
    subscriptions: (await docRef
      .collection('subscriptions')
      .get()
      .then((snapshot) => snapshot.docs.map((x) => x.data()))) as Subscription[],
    polis: value && value.polis,
    authResult: value && value.authResult,
  });
  return chat;
};

export const updateChat = (
  chat: Chat,
  { polis, authResult }: { polis?: Polis | null; authResult?: AuthResult | null },
) => {
  functions.logger.log(chat.userId);
  const docRef = db.collection('chats').doc(`${chat.userId}`);
  if (typeof polis !== undefined) {
    chat.polis = polis;
  }
  if (typeof authResult !== undefined) {
    chat.authResult = authResult;
  }
  return docRef.update({
    polis,
    authResult,
  });
};

export const removeChat = async (userId) => {
  const docRef = db.collection('chats').doc(`${userId}`);
  await docRef.collection('subscriptions');

  await docRef
    .collection('subscriptions')
    .listDocuments()
    .then((val) => {
      return Promise.all(
        val.map((val) => {
          db.batch().delete(val);
        }),
      );
    });

  return docRef.delete();
};

export const setSubscription = async (chat: Chat, subscription: Subscription) => {
  const docRef = db.collection('chats').doc(`${chat.userId}`);
  const subRef = docRef.collection('subscriptions').doc(subscription.id);
  await subRef.set(subscription);
  return subscription;
};

export const getSubscriptions = async (chat: Chat): Promise<Subscription[] | undefined> => {
  const docRef = db.collection('chats').doc(`${chat.userId}`);
  const subs = await docRef
    .collection('subscriptions')
    .get()
    .then((snapshot) => snapshot.docs.map((x) => x.data()));
  return subs as Subscription[];
};

export const removeSubscription = async (chat: Chat, subscriptionId: string) => {
  const docRef = db.collection('chats').doc(`${chat.userId}`);
  const subRef = docRef.collection('subscriptions').doc(subscriptionId);
  const sub = await subRef.get();
  if (sub.exists) {
    return subRef.delete();
  }
  throw new Error(`Подписка ${subscriptionId} не найдена`);
};