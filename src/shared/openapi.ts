export const ApiTags = {
  auth: 'Auth',
  users: 'Users',
  customers: 'Customers',
  contacts: 'Contacts',
  enquiries: 'Enquiries',
  events: 'Events',
  followups: 'Follow-ups',
  bookings: 'Bookings',
  payments: 'Payments',
  invoices: 'Invoices',
  vendors: 'Vendors',
  inventory: 'Inventory',
  inventoryOrders: 'Inventory Orders',
  dashboard: 'Dashboard',
  health: 'Health',
} as const;

export const bearerAuth = [{ bearerAuth: [] }] as const;

export const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {},
  },
  required: ['success', 'data'],
} as const;

export const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [false] },
    message: { type: 'string' },
    errors: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['success', 'message'],
} as const;

export const idParam = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', description: 'Numeric record id' },
  },
} as const;

export const paginationQuery = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string' },
    sortBy: { type: 'string' },
    order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
} as const;

export const standardResponses = {
  400: { description: 'Validation error', content: { 'application/json': { schema: errorResponse } } },
  401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponse } } },
  403: { description: 'Forbidden', content: { 'application/json': { schema: errorResponse } } },
  404: { description: 'Not found', content: { 'application/json': { schema: errorResponse } } },
  409: { description: 'Conflict', content: { 'application/json': { schema: errorResponse } } },
} as const;

export function okResponse(description = 'Success') {
  return {
    200: {
      description,
      content: { 'application/json': { schema: successResponse } },
    },
    ...standardResponses,
  };
}

export function createdResponse(description = 'Created') {
  return {
    201: {
      description,
      content: { 'application/json': { schema: successResponse } },
    },
    ...standardResponses,
  };
}
