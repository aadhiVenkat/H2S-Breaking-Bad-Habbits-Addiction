export interface AuthAccount {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  geminiApiKey?: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  username: string;
}

export const ACCOUNTS_KEY = "reclaim_accounts_v1";
export const SESSION_KEY = "reclaim_session_v1";
