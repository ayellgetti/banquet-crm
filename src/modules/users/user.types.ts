import type { UserRole } from '@prisma/client';

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  dob: string;
  mobileNo: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
