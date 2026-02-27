export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  created_at?: string;
  clicked?: boolean;
  status?: string;
  [key: string]: any;
}
