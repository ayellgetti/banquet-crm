import fp from 'fastify-plugin';
import { loadEnv } from '../config/env.js';
import { TokenService } from '../modules/auth/token.service.js';

declare module 'fastify' {
  interface FastifyInstance {
    tokenService: TokenService;
  }
}

export default fp(async (app) => {
  const tokenService = new TokenService(loadEnv());
  app.decorate('tokenService', tokenService);
});
