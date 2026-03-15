/**
 * Send a OneSignal push notification to a specific user by their external user ID.
 * @param {string} externalUserId - The user's _id from MongoDB used as OneSignal external_id
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {object} [data] - Optional additional data payload
 */
export const sendOneSignalNotification = async (externalUserId, title, message, data = {}) => {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY

  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn('OneSignal credentials not configured. Skipping notification.')
    return null
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [externalUserId] },
    target_channel: 'push',
    headings: { en: title },
    contents: { en: message },
    data
  }

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('OneSignal notification failed:', result)
      return null
    }

    return result
  } catch (error) {
    console.error('OneSignal notification error:', error.message)
    return null
  }
}

/**
 * Send a OneSignal push notification to all subscribed users on the app.
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {object} [data] - Optional additional data payload
 */
export const sendOneSignalToAll = async (title, message, data = {}) => {
  const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
  const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY

  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn('OneSignal credentials not configured. Skipping notification.')
    return null
  }

  const payload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'],
    target_channel: 'push',
    headings: { en: title },
    contents: { en: message },
    data
  }

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    console.log('OneSignal broadcast notification result:', result)
    if (!response.ok) {
      console.error('OneSignal broadcast notification failed:', result)
      return null
    }

    return result
  } catch (error) {
    console.error('OneSignal broadcast notification error:', error.message)
    return null
  }
}
