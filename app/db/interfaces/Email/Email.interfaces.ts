export interface EmailData {
  email: string;
  subject: string;
  page: string;
  locale: string | null;
  context?: any;
  attachments?: any[];
}
