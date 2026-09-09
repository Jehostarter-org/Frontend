// frontend/jeho_starter/lib/api/messagesApiSlice.ts

import { apiSlice } from './apiSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Participant {
    id: number;
    full_name: string;
    email: string;
    is_gold: boolean;
    avatar_url: string | null;
}

export interface MessageAttachment {
    id: number;
    url: string;
    filename: string;
    filesize: number;
    uploaded_at: string;
}

export interface ServiceCard {
    title: string;
    date?: string;
    price?: number;
    currency?: string;
    service_type?: string;
    [key: string]: unknown;
}

export interface Message {
    id: number;
    conversation: number;
    sender: Participant;
    reply_to: Message | null;
    body: string;
    is_read: boolean;
    read_at: string | null;
    service_card: ServiceCard | null;
    attachments: MessageAttachment[];
    created_at: string;
}

export interface LastMessage {
    id: number;
    body: string;
    sender_id: number;
    created_at: string;
}

export interface Conversation {
    id: number;
    other_participant: Participant | null;
    last_message: LastMessage | null;
    unread_count: number;
    service_type: string | null;
    linked_object_type: string | null;
    linked_object_id: string | number | null;
    currency_code: string | null;
    location_country: string | null;
    created_at: string;
    updated_at: string;
}

// Django paginated response wrapper
interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface StartConversationPayload {
    recipient_id?: number | string | null;
    initial_message?: string;
    service_type?: string | null;
    linked_object_type?: string;
    linked_object_id?: string | number | null;
    service_card?: ServiceCard | null;
}

export interface SendMessagePayload {
    conversation: number;
    body: string;
    reply_to?: number | null;
}

export interface SupportStartPayload {
    initial_message?: string;
    subject?: string;
}

export interface SupportStartResponse {
    conversation_id: number;
    subject: string;
    customer: {
        id: number;
        full_name: string;
        email: string;
    } | null;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const messagesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/messaging/inbox/
        getInbox: builder.query<Conversation[], void>({
            query: () => '/messaging/inbox/',
            transformResponse: (response: PaginatedResponse<Conversation> | Conversation[]) => {
                if (Array.isArray(response)) return response;
                return response.results ?? [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Conversation' as const, id })),
                        { type: 'Conversation' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Conversation' as const, id: 'LIST' }],
        }),

        // GET /api/messaging/unread-count/
        getMessagingUnreadCount: builder.query<{ unread_count: number }, void>({
            query: () => '/messaging/unread-count/',
            providesTags: [{ type: 'Conversation' as const, id: 'UNREAD' }],
        }),

        // POST /api/messaging/start/
        startConversation: builder.mutation<Conversation, StartConversationPayload>({
            query: (body) => ({
                url: '/messaging/start/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Conversation' as const, id: 'LIST' }],
        }),

        // POST /api/messaging/support/start/
        startSupport: builder.mutation<SupportStartResponse, SupportStartPayload>({
            query: (body) => ({
                url: '/messaging/support/start/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Conversation' as const, id: 'LIST' }],
        }),

        // GET /api/messaging/conversations/<id>/
        getConversation: builder.query<Conversation, number>({
            query: (id) => `/messaging/conversations/${id}/`,
            providesTags: (_result, _err, id) => [{ type: 'Conversation' as const, id }],
        }),

        // GET /api/messaging/conversations/<id>/messages/
        getMessages: builder.query<Message[], number>({
            query: (conversationId) =>
                `/messaging/conversations/${conversationId}/messages/`,
            transformResponse: (response: PaginatedResponse<Message> | Message[]) => {
                if (Array.isArray(response)) return response;
                return response.results ?? [];
            },
            providesTags: (_result, _err, conversationId) => [
                { type: 'Message' as const, id: conversationId },
            ],
        }),

        // POST /api/messaging/conversations/<id>/messages/send/
        sendMessage: builder.mutation<Message, SendMessagePayload>({
            query: ({ conversation, body, reply_to }) => ({
                url: `/messaging/conversations/${conversation}/messages/send/`,
                method: 'POST',
                body: { conversation, body, reply_to },
            }),
            invalidatesTags: (_result, _err, { conversation }) => [
                { type: 'Message' as const, id: conversation },
                { type: 'Conversation' as const, id: conversation },
                { type: 'Conversation' as const, id: 'LIST' },
                { type: 'Conversation' as const, id: 'UNREAD' },
            ],
        }),

        // POST /api/messaging/conversations/<id>/messages/send/ (with files)
        sendMessageWithAttachments: builder.mutation<Message, FormData>({
            query: (formData) => ({
                url: `/messaging/conversations/${formData.get('conversation')}/messages/send/`,
                method: 'POST',
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_result, _err, formData) => [
                { type: 'Message' as const, id: Number(formData.get('conversation')) },
                { type: 'Conversation' as const, id: Number(formData.get('conversation')) },
                { type: 'Conversation' as const, id: 'LIST' },
                { type: 'Conversation' as const, id: 'UNREAD' },
            ],
        }),

        // POST /api/messaging/conversations/<id>/read/
        markConversationRead: builder.mutation<{ marked_read: number }, number>({
            query: (conversationId) => ({
                url: `/messaging/conversations/${conversationId}/read/`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _err, conversationId) => [
                { type: 'Conversation' as const, id: conversationId },
                { type: 'Conversation' as const, id: 'LIST' },
                { type: 'Conversation' as const, id: 'UNREAD' },
            ],
        }),

        // DELETE /api/messaging/conversations/<id>/messages/<message_id>/
        deleteMessage: builder.mutation<void, { conversation: number; messageId: number }>({
            query: ({ conversation, messageId }) => ({
                url: `/messaging/conversations/${conversation}/messages/${messageId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _err, { conversation }) => [
                { type: 'Message' as const, id: conversation },
                { type: 'Conversation' as const, id: conversation },
                { type: 'Conversation' as const, id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: true,
});

// Export hooks
export const {
    useGetInboxQuery,
    useGetMessagingUnreadCountQuery,
    useStartConversationMutation,
    useStartSupportMutation,
    useGetConversationQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useSendMessageWithAttachmentsMutation,
    useMarkConversationReadMutation,
    useDeleteMessageMutation,
} = messagesApiSlice;
