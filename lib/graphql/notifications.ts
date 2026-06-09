// lib/graphql/notifications.ts
// All GraphQL operations for notifications.
// These map exactly to schema/queries.py, mutations.py, subscriptions.py

// ── Queries ───────────────────────────────────────────────────────────────────

export const GET_MY_NOTIFICATIONS = `
  query GetMyNotifications($unreadOnly: Boolean, $limit: Int) {
    myNotifications(unreadOnly: $unreadOnly, limit: $limit) {
      id
      notificationType
      title
      message
      isRead
      link
      createdAt
      actor {
        username
        avatar
      }
    }
  }
`;

export const GET_UNREAD_COUNT = `
  query GetUnreadCount {
    unreadNotificationCount
  }
`;

// ── Mutations ─────────────────────────────────────────────────────────────────

export const MARK_NOTIFICATION_READ = `
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ── Subscription ──────────────────────────────────────────────────────────────
// This runs over ws://127.0.0.1:8000/ws/graphql/
// Django pushes whenever Notification.objects.create() is called anywhere
// in mutations.py or services/views.py (_broadcast → user_notifications_{id})

export const MY_NOTIFICATIONS_SUBSCRIPTION = `
  subscription MyNotifications {
    myNotifications {
      id
      notificationType
      title
      message
      isRead
      link
      createdAt
      actor {
        username
      }
    }
  }
`;