import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging, type Messaging } from 'firebase-admin/messaging'

// firebase-admin v14 dropped the old namespaced default export (admin.apps,
// admin.credential.cert, admin.messaging()) in favor of this modular API.
//
// Push notifications are best-effort (see utils/firebase.ts) — missing or
// invalid FIREBASE_* credentials shouldn't take down the whole API process,
// so initialization failures are caught and `messaging` degrades to null.
let messagingClient: Messaging | null = null

try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    })
  }
  messagingClient = getMessaging()
} catch (err) {
  console.warn('Firebase push notifications disabled — invalid/missing FIREBASE_* credentials:', (err as Error).message)
}

export const messaging = messagingClient
