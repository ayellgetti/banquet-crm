import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { loadEnv } from './config/env.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { bookingRoutes } from './modules/bookings/booking.routes.js';
import { customerRoutes } from './modules/customers/customer.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { leadRoutes } from './modules/leads/lead.routes.js';
import { enquiryRoutes } from './modules/enquiries/enquiry.routes.js';
import { eventRoutes } from './modules/events/event.routes.js';
import { followupRoutes } from './modules/followups/followup.routes.js';
import { invoiceRoutes } from './modules/invoices/invoice.routes.js';
import { inventoryOrderRoutes } from './modules/inventory-orders/inventory-order.routes.js';
import { inventoryRoutes } from './modules/inventory/inventory.routes.js';
import { paymentRoutes } from './modules/payments/payment.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { vendorRoutes } from './modules/vendors/vendor.routes.js';
import { directoryContactRoutes } from './modules/directory-contacts/directory-contact.routes.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import prismaPlugin from './plugins/prisma.js';
import swaggerPlugin from './plugins/swagger.js';
import tokenPlugin from './plugins/token.js';
import { ApiTags, okResponse } from './shared/openapi.js';
import { successResponse } from './shared/response.js';

export async function buildApp() {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: ['req.headers.authorization', 'body.password', 'body.refreshToken'],
    },
  });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);
  await app.register(tokenPlugin);

  registerErrorHandler(app);

  app.get(
    '/health',
    {
      schema: {
        tags: [ApiTags.health],
        summary: 'Health check',
        response: okResponse('Service is healthy'),
      },
    },
    async () => successResponse({ status: 'ok' }),
  );

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(leadRoutes);
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(customerRoutes, { prefix: '/customers' });
  await app.register(enquiryRoutes, { prefix: '/enquiries' });
  await app.register(eventRoutes, { prefix: '/events' });
  await app.register(followupRoutes, { prefix: '/followups' });
  await app.register(bookingRoutes, { prefix: '/bookings' });
  await app.register(paymentRoutes, { prefix: '/payments' });
  await app.register(invoiceRoutes, { prefix: '/invoices' });
  await app.register(vendorRoutes, { prefix: '/vendors' });
  await app.register(directoryContactRoutes, { prefix: '/directory-contacts' });
  await app.register(inventoryRoutes, { prefix: '/inventory' });
  await app.register(inventoryOrderRoutes, { prefix: '/inventory-orders' });
  await app.register(dashboardRoutes, { prefix: '/dashboard' });

  return app;
}
