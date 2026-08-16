import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { loadEnv } from '../config/env.js';

export default fp(async (app) => {
  const env = loadEnv();

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Banquet CRM API',
        description: 'Modular monolith REST API for Banquet CRM',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Local development',
        },
      ],
      tags: [
        { name: 'Health', description: 'Service health checks' },
        { name: 'Auth', description: 'Authentication' },
        { name: 'Users', description: 'Staff user management' },
        { name: 'Customers', description: 'Customer CRM' },
        { name: 'Contacts', description: 'Directory contacts (employee / other)' },
        { name: 'Enquiries', description: 'Lead enquiries' },
        { name: 'Events', description: 'Banquet events' },
        { name: 'Follow-ups', description: 'Sales follow-ups' },
        { name: 'Bookings', description: 'Event bookings' },
        { name: 'Payments', description: 'Income and expense payments' },
        { name: 'Vendors', description: 'Vendor directory' },
        { name: 'Inventory', description: 'Inventory items' },
        { name: 'Dashboard', description: 'Dashboard metrics' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token from POST /auth/login',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });
});
