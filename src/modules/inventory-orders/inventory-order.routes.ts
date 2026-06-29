import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import {
  ApiTags,
  bearerAuth,
  createdResponse,
  idParam,
  okResponse,
  paginationQuery,
} from '../../shared/openapi.js';
import { InventoryOrderController } from './inventory-order.controller.js';
import { InventoryOrderRepository } from './inventory-order.repository.js';
import { InventoryOrderService } from './inventory-order.service.js';

export async function inventoryOrderRoutes(app: FastifyInstance) {
  const repository = new InventoryOrderRepository(app.prisma);
  const service = new InventoryOrderService(repository, app.prisma);
  const controller = new InventoryOrderController(service);

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.inventoryOrders],
      summary: 'List inventory orders',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.inventoryOrders],
      summary: 'Place inventory order',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.inventoryOrders],
      summary: 'Get inventory order by id',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });
}
