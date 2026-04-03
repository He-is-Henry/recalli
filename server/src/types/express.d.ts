import { PayloadDto } from '../auth/payload.dto';

declare global {
  namespace Express {
    interface Request {
      user?: PayloadDto;
      tenantId?: string;
    }
  }
}

export {};
