export interface VKMessage {
  id: number;
  date: number;
  from_id: number;
  peer_id: number;
  text: string;
  payload?: string;
  conversation_message_id?: number;
  ref?: string;
  ref_source?: string;
  attachments?: VKAttachment[];
  fwd_messages?: VKMessage[];
  reply_message?: VKMessage;
}

export interface VKAttachment {
  type: 'photo' | 'video' | 'audio' | 'doc' | 'link' | 'wall' | 'market' | 'sticker';
  [key: string]: unknown;
}

export interface VKUpdate {
  type:
    | 'message_new'
    | 'message_event'
    | 'message_reply'
    | 'message_typing_state'
    | 'photo_new'
    | 'audio_new';
  object: {
    message?: VKMessage;
    client_info?: {
      button_actions: boolean;
      keyboard: boolean;
      inline_keyboard: boolean;
      lang_id: string;
    };
    event_id?: string;
    user_id?: number;
    peer_id?: number;
    payload?: string;
  };
  group_id: number;
  secret?: string;
}

export interface VKCallbackButton {
  action: {
    type: 'text' | 'open_link' | 'location' | 'vkpay' | 'open_app';
    label?: string;
    link?: string;
    payload?: string;
  };
  color?: 'primary' | 'secondary' | 'negative' | 'positive';
}

export interface VKKeyboard {
  one_time?: boolean;
  buttons: VKCallbackButton[][];
}

export interface VKContext {
  update: VKUpdate;
  message: VKMessage | undefined;
  peerId: number;
  userId: number;
  text: string;
  sendMessage: (
    peerId: number,
    text: string,
    keyboard?: string,
    attachment?: string,
  ) => Promise<unknown>;
  payload?: string;
  eventId?: string;
}

export interface SessionData {
  // Сессия пользователя
  [key: string]: unknown;
}
