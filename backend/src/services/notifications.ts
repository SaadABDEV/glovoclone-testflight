import admin from "firebase-admin";
import { env } from "../config/env.js";

let initialized = false;

const initFirebase = () => {
  if (initialized) return;
  if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY_BASE64) return;

  const privateKey = Buffer.from(env.FCM_PRIVATE_KEY_BASE64, "base64").toString("utf-8");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FCM_PROJECT_ID,
      clientEmail: env.FCM_CLIENT_EMAIL,
      privateKey
    })
  });
  initialized = true;
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) => {
  initFirebase();
  if (!initialized) return;

  await admin.messaging().send({
    token,
    notification: { title, body },
    data,
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1
        }
      }
    }
  });
};
