
export type NotificationKind = 'response' | 'invite' | 'confirmed';
export interface AppNotification { id: string; kind: NotificationKind; personId?: string; text: string; at: number; transient?: boolean; }
