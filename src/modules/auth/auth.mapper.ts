import type { User } from '@prisma/client';
import type { UserProfile } from './auth.types.js';

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}
