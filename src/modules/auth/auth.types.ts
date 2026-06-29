import { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  id: string;
  username: string;
  role: UserRole;
}

export interface TokenMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: UserRole;
}

export interface LoginResult extends AuthTokens {
  user: UserProfile;
}
