export interface AuthState {
  isAuthenticated: boolean;
  password: string;
}

export interface TemplateStyle {
  id: string;
  name: string;
  hasLogo: boolean;
  multiLineAddress: boolean;
  hasCardInfo: boolean;
  hasQueueNumber: boolean;
  additionalInfo?: string[];
} 