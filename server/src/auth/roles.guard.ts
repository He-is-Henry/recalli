import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Public } from './auth.guard';

export const Roles = Reflector.createDecorator<string[]>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;

    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }
    if (!user) throw new UnauthorizedException();
    const roles = this.reflector.get(Roles, context.getHandler()) ?? ['admin'];

    if (user.role === 'admin') return true;

    return roles.includes(user.role);
  }
}
