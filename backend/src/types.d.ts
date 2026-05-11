import type { JwtPayload } from './middleware/auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}
