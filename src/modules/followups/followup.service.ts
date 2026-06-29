import { LeadStatus, type PrismaClient } from '@prisma/client';
import { loadEnv } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { getDayBoundsInTimezone, getStartOfTodayInTimezone } from '../../utils/timezone.js';
import { toFollowupResponse } from './followup.mapper.js';
import { FollowupRepository } from './followup.repository.js';
import type {
  CreateFollowupInput,
  ListFollowupsQuery,
  UpdateFollowupInput,
} from './followup.schema.js';
import { parseBigIntId, parseOptionalBigInt } from './followup.schema.js';
import type { FollowupResponse } from './followup.types.js';

export class FollowupService {
  private readonly timeZone: string;

  constructor(
    private readonly repository: FollowupRepository,
    private readonly prisma: PrismaClient,
  ) {
    this.timeZone = loadEnv().TZ;
  }

  async list(query: ListFollowupsQuery): Promise<PaginatedResult<FollowupResponse>> {
    const [followups, total] = await this.repository.findAll(query);

    return {
      items: followups.map(toFollowupResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getToday(): Promise<FollowupResponse[]> {
    const { start, end } = getDayBoundsInTimezone(this.timeZone);
    const followups = await this.repository.findToday(start, end);
    return followups.map(toFollowupResponse);
  }

  async getPending(): Promise<FollowupResponse[]> {
    const startOfToday = getStartOfTodayInTimezone(this.timeZone);
    const followups = await this.repository.findPending(startOfToday);
    return followups.map(toFollowupResponse);
  }

  async getOverdue(): Promise<FollowupResponse[]> {
    const followups = await this.repository.findOverdue(new Date());
    return followups.map(toFollowupResponse);
  }

  async create(input: CreateFollowupInput): Promise<FollowupResponse> {
    const enquiryId = parseBigIntId(input.enquiryId);
    const enquiry = await this.prisma.enquiry.findUnique({ where: { id: enquiryId } });

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    const eventId = parseOptionalBigInt(input.eventId);
    if (eventId) {
      await this.ensureEventBelongsToEnquiry(eventId, enquiryId);
    }

    const followedBy = parseOptionalBigInt(input.followedBy);
    if (followedBy) {
      await this.ensureUserExists(followedBy);
    }

    if (input.enquiryStatus) {
      if (enquiry.status === LeadStatus.CONVERTED) {
        throw new AppError('Converted enquiries cannot be updated', 400);
      }

      if (enquiry.status !== input.enquiryStatus) {
        await this.prisma.enquiry.update({
          where: { id: enquiryId },
          data: { status: input.enquiryStatus },
        });
      }
    }

    const followup = await this.repository.create({
      enquiryId,
      eventId,
      followupDate: input.followupDate ? new Date(input.followupDate) : undefined,
      nextFollowupDate:
        input.nextFollowupDate === undefined
          ? undefined
          : input.nextFollowupDate === null
            ? null
            : new Date(input.nextFollowupDate),
      communicationType: input.communicationType,
      comments: input.comments,
      followedBy,
    });

    return toFollowupResponse(followup);
  }

  async update(id: bigint, input: UpdateFollowupInput): Promise<FollowupResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Follow-up not found', 404);
    }

    const eventId = parseOptionalBigInt(input.eventId);
    if (eventId) {
      await this.ensureEventBelongsToEnquiry(eventId, existing.enquiryId);
    }

    const followedBy = parseOptionalBigInt(input.followedBy);
    if (followedBy) {
      await this.ensureUserExists(followedBy);
    }

    const followup = await this.repository.update(id, {
      ...(input.eventId !== undefined && {
        event: eventId === null ? { disconnect: true } : { connect: { id: eventId } },
      }),
      ...(input.followupDate !== undefined && { followupDate: new Date(input.followupDate) }),
      ...(input.nextFollowupDate !== undefined && {
        nextFollowupDate:
          input.nextFollowupDate === null ? null : new Date(input.nextFollowupDate),
      }),
      ...(input.communicationType !== undefined && {
        communicationType: input.communicationType,
      }),
      ...(input.comments !== undefined && { comments: input.comments }),
      ...(input.followedBy !== undefined && {
        followedByUser:
          followedBy === null
            ? { disconnect: true }
            : { connect: { id: followedBy as bigint } },
      }),
    });

    return toFollowupResponse(followup);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const followup = await this.repository.findById(id);

    if (!followup) {
      throw new AppError('Follow-up not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Follow-up deleted' };
  }

  private async ensureEventBelongsToEnquiry(eventId: bigint, enquiryId: bigint): Promise<void> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.enquiryId !== enquiryId) {
      throw new AppError('Event does not belong to this enquiry', 400);
    }
  }

  private async ensureUserExists(userId: bigint): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Follow-up user not found', 404);
    }
  }
}
