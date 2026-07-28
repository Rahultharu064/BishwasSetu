import { messaging } from '../config/firebase'

export interface PushPayload {
  token:   string       // FCM device token
  title:   string
  body:    string
  data?:   Record<string, string>
}

export interface MulticastPayload {
  tokens:  string[]
  title:   string
  body:    string
  data?:   Record<string, string>
}

// ── Send to single device ──────────────────────────────────────

export const sendPushNotification = async (
  payload: PushPayload
): Promise<boolean> => {
  if (!payload.token || !messaging) return false

  try {
    await messaging.send({
      token: payload.token,
      notification: {
        title: payload.title,
        body:  payload.body,
      },
      data:    payload.data ?? {},
      android: {
        priority: 'high',
        notification: {
          sound:       'default',
          channelId:   'bishwassetu_main',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1 },
        },
      },
    })
    return true
  } catch (err: any) {
    console.error('Push notification failed:', err.message)
    return false
  }
}

// ── Send to multiple devices ───────────────────────────────────

export const sendMulticastNotification = async (
  payload: MulticastPayload
): Promise<void> => {
  if (!payload.tokens.length || !messaging) return

  const chunks = []
  for (let i = 0; i < payload.tokens.length; i += 500) {
    chunks.push(payload.tokens.slice(i, i + 500))
  }

  for (const chunk of chunks) {
    try {
      await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: {
          title: payload.title,
          body:  payload.body,
        },
        data: payload.data ?? {},
      })
    } catch (err: any) {
      console.error('Multicast notification failed:', err.message)
    }
  }
}