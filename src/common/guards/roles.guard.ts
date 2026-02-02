import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../../DB/models/user.model';

import { AuthReq } from './auth.guard';
import { SetMetadata } from '@nestjs/common';
import { Shop } from '../../DB/models/shop.model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthReq>(); //مفيش await عشان هو sync  و ليس async
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }
    if (
      !requiredRoles.includes(user.role) &&
      user.role !== RoleEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
   
    return true;
  }
}
