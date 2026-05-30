/**
 * Максимальное значение random_id для messages.send.
 * VK требует случайное число в диапазоне signed int32.
 * @see https://dev.vk.com/ru/method/messages.send
 */
export const VK_MAX_RANDOM_ID = 2 ** 31 - 1; // 2_147_483_647

/**
 * Порог peer_id, выше которого сообщение отправлено в беседу (групповой чат).
 * peer_id = VK_PEER_CHAT_OFFSET + chat_id
 * @see https://dev.vk.com/ru/api/messages/chat
 */
export const VK_PEER_CHAT_OFFSET = 2_000_000_000;
