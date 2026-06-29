import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toVendorResponse } from './vendor.mapper.js';
import { VendorRepository } from './vendor.repository.js';
import type { CreateVendorInput, ListVendorsQuery, UpdateVendorInput } from './vendor.schema.js';
import { parseOptionalBigInt } from './vendor.schema.js';
import type { VendorResponse } from './vendor.types.js';

export class VendorService {
  constructor(
    private readonly repository: VendorRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async list(query: ListVendorsQuery): Promise<PaginatedResult<VendorResponse>> {
    const [vendors, total] = await this.repository.findAll(query);

    return {
      items: vendors.map(toVendorResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async listCategories() {
    const categories = await this.repository.findAllCategories();

    return categories.map((category) => ({
      id: category.id.toString(),
      categoryName: category.categoryName,
    }));
  }

  async getById(id: bigint): Promise<VendorResponse> {
    const vendor = await this.repository.findById(id);

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    return toVendorResponse(vendor);
  }

  async create(input: CreateVendorInput): Promise<VendorResponse> {
    const categoryId = parseOptionalBigInt(input.categoryId);

    if (categoryId) {
      await this.ensureCategoryExists(categoryId);
    }

    const vendor = await this.repository.create({
      categoryId,
      vendorName: input.vendorName,
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      gstNumber: input.gstNumber,
      notes: input.notes,
    });

    return toVendorResponse(vendor);
  }

  async update(id: bigint, input: UpdateVendorInput): Promise<VendorResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Vendor not found', 404);
    }

    const categoryId = parseOptionalBigInt(input.categoryId);

    if (categoryId) {
      await this.ensureCategoryExists(categoryId);
    }

    const vendor = await this.repository.update(id, {
      ...(input.categoryId !== undefined && { categoryId }),
      ...(input.vendorName !== undefined && { vendorName: input.vendorName }),
      ...(input.mobile !== undefined && { mobile: input.mobile }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.gstNumber !== undefined && { gstNumber: input.gstNumber }),
      ...(input.notes !== undefined && { notes: input.notes }),
    });

    return toVendorResponse(vendor);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const vendor = await this.repository.findById(id);

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Vendor deleted' };
  }

  private async ensureCategoryExists(categoryId: bigint): Promise<void> {
    const category = await this.prisma.vendorCategory.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new AppError('Vendor category not found', 404);
    }
  }
}
