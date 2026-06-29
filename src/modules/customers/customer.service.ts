import { AppError } from '../../shared/errors/app-error.js';
import { buildPaginationMeta, type PaginatedResult } from '../../shared/pagination.js';
import { toCustomerResponse } from './customer.mapper.js';
import { CustomerRepository } from './customer.repository.js';
import type {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from './customer.schema.js';
import type { CustomerResponse } from './customer.types.js';

export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  async list(query: ListCustomersQuery): Promise<PaginatedResult<CustomerResponse>> {
    const [customers, total] = await this.repository.findAll(query);

    return {
      items: customers.map(toCustomerResponse),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(id: bigint): Promise<CustomerResponse> {
    const customer = await this.repository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return toCustomerResponse(customer);
  }

  async create(input: CreateCustomerInput): Promise<CustomerResponse> {
    const existing = await this.repository.findByMobileNo(input.mobileNo);

    if (existing) {
      throw new AppError('A customer with this mobile number already exists', 409);
    }

    if (input.alternateMobileNo) {
      const alternateExists = await this.repository.findByMobileNo(input.alternateMobileNo);

      if (alternateExists) {
        throw new AppError('Alternate mobile number is already in use', 409);
      }
    }

    const customer = await this.repository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      mobileNo: input.mobileNo,
      alternateMobileNo: input.alternateMobileNo,
      emailId: input.emailId,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
    });

    return toCustomerResponse(customer);
  }

  async update(id: bigint, input: UpdateCustomerInput): Promise<CustomerResponse> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new AppError('Customer not found', 404);
    }

    if (input.mobileNo && input.mobileNo !== existing.mobileNo) {
      const duplicate = await this.repository.findByMobileNo(input.mobileNo);

      if (duplicate && duplicate.id !== id) {
        throw new AppError('A customer with this mobile number already exists', 409);
      }
    }

    if (input.alternateMobileNo) {
      const duplicate = await this.repository.findByMobileNo(input.alternateMobileNo);

      if (duplicate && duplicate.id !== id) {
        throw new AppError('Alternate mobile number is already in use', 409);
      }
    }

    const updated = await this.repository.update(id, {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.mobileNo !== undefined && { mobileNo: input.mobileNo }),
      ...(input.alternateMobileNo !== undefined && {
        alternateMobileNo: input.alternateMobileNo,
      }),
      ...(input.emailId !== undefined && { emailId: input.emailId }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.pincode !== undefined && { pincode: input.pincode }),
    });

    return toCustomerResponse(updated);
  }

  async delete(id: bigint): Promise<{ message: string }> {
    const customer = await this.repository.findById(id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    await this.repository.delete(id);

    return { message: 'Customer deleted' };
  }
}
