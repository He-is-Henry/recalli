import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PayloadDto } from './payload.dto';
import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<boolean>();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload: PayloadDto = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }

    return true;
  }

  extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
