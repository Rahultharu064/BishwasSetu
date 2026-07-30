import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging, type Messaging } from 'firebase-admin/messaging'

// firebase-admin v14 dropped the old namespaced default export (admin.apps,
// admin.credential.cert, admin.messaging()) in favor of this modular API.
//
// Push notifications are best-effort (see utils/firebase.ts) — missing or
// invalid FIREBASE_* credentials shouldn't take down the whole API process,
// so initialization failures are caught and `messaging` degrades to null.
let messagingClient: Messaging | null = null

// A service-account private key is always a PEM block; a value starting
// with "AIzaSy" is a Firebase *Web API key* (from the client-side SDK
// config snippet) — a common mix-up, and firebase-admin can never accept
// one since it's not a credential at all, just a public per-project
// identifier. Detect it up front so the failure reason is actionable
// instead of a generic "Failed to parse private key" from deep in jose.
const rawKey = process.env.FIREBASE_PRIVATE_KEY
const looksLikeWebApiKey = !!rawKey && /^AIzaSy/.test(rawKey.trim())

try {
  if (looksLikeWebApiKey) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is set to a Web API key ("AIzaSy...") — that\'s the ' +
      'client-side config value, not a server credential. firebase-admin needs the ' +
      '"private_key" field from a service account JSON: Firebase Console → Project ' +
      'Settings → Service Accounts → Generate new private key. Copy private_key, ' +
      'client_email, and project_id from that downloaded JSON into .env.'
    )
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        privateKey:  rawKey!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    })
  }
  messagingClient = getMessaging()
} catch (err) {
  console.warn('Firebase push notifications disabled — invalid/missing FIREBASE_* credentials:', (err as Error).message)
}

export const messaging = messagingClient
