import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toUserResponse } from './user.mapper.js';
import { UserRepository } from './user.repository.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.schema.js';
import type { UserResponse } from './user.types.js';

const BCRYPT_ROUNDS = 12;

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async list(query: ListUsersQuery): Promise<PaginatedResult<UserResponse>> {
    const [users, total] = await this.repository.findAll(query);

    return {
      items: users.map(toUserResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<UserResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toUserResponse(user);
  }

  async create(input: CreateUserInput): Promise<UserResponse> {
    const username = input.mobileNo;

    const existing = await this.repository.findByUsername(username);

    if (existing) {
      throw new AppError('A user with this mobile number already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await this.repository.create({
      username,
      firstName: input.firstName,
      lastName: input.lastName,
      dob: new Date(input.dob),
      mobileNo: input.mobileNo,
      email: input.email,
      role: input.role,
      passwordHash,
    });

    return toUserResponse(user);
  }

  async update(id: bigint, input: UpdateUserInput): Promise<UserResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (input.mobileNo && input.mobileNo !== user.username) {
      const duplicate = await this.repository.findByUsername(input.mobileNo);

      if (duplicate && duplicate.id !== id) {
        throw new AppError('A user with this mobile number already exists', 409);
      }
    }

    if (input.role && input.role !== user.role && user.role === UserRole.ADMIN) {
      const adminCount = await this.repository.countByRole(UserRole.ADMIN);

      if (adminCount <= 1) {
        throw new AppError('Cannot change role of the last admin user', 400);
      }
    }

    const updateData: Parameters<UserRepository['update']>[1] = {};

    if (input.firstName !== undefined) {
      updateData.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      updateData.lastName = input.lastName;
    }

    if (input.dob !== undefined) {
      updateData.dob = new Date(input.dob);
    }

    if (input.mobileNo !== undefined) {
      updateData.mobileNo = input.mobileNo;
      updateData.username = input.mobileNo;
    }

    if (input.email !== undefined) {
      updateData.email = input.email;
    }

    if (input.role !== undefined) {
      updateData.role = input.role;
    }

    if (input.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    }

    const updated = await this.repository.update(id, updateData);

    return toUserResponse(updated);
  }

  async delete(id: bigint, actorId: string): Promise<{ message: string }> {
    if (id.toString() === actorId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.repository.countByRole(UserRole.ADMIN);

      if (adminCount <= 1) {
        throw new AppError('Cannot delete the last admin user', 400);
      }
    }

    await this.repository.delete(id);

    return { message: 'User deleted' };
  }
}
