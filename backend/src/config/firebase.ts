import admin from 'firebase-admin'

const fadmin: any = admin

if (!fadmin.apps.length) {
  fadmin.initializeApp({
    credential: fadmin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    }),
  })
}

export const firebaseAdmin = fadmin
export const messaging     = fadmin.messaging()