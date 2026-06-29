import type { User } from '@prisma/client';
import type { UserResponse } from './user.types.js';

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id.toString(),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    dob: formatDate(user.dob),
    mobileNo: user.mobileNo,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
