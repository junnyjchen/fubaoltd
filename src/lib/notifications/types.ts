// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'payment' | 'system' | 'promotion' | 'social';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
