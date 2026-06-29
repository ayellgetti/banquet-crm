import type { Customer } from '@prisma/client';
import type { CustomerResponse } from './customer.types.js';

export function toCustomerResponse(customer: Customer): CustomerResponse {
  return {
    id: customer.id.toString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    mobileNo: customer.mobileNo,
    alternateMobileNo: customer.alternateMobileNo,
    emailId: customer.emailId,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}
