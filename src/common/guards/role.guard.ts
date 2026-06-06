import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RoleGuard — checks that the authenticated user has the required role(s).
 *
 * Must be used AFTER AuthGuard (which attaches req.user).
 *
 * In this project, the role is read from the X-User-Role header (for simplicity).
 * In production, the role would come from the JWT payload set by AuthGuard.
 *
 * Usage:
 *   @UseGuards(AuthGuard, RoleGuard)
 *   @Roles('admin')
 *   @Delete(':id')
 *   remove(...) {}
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Fetch the roles declared on the route/controller via @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @Roles() decorator is present, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Read role from the X-User-Role header (demo purpose).
    // In production: use (request as any).user.role from JWT payload.
    const userRole = request.headers['x-user-role'] as string;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required role(s): [${requiredRoles.join(', ')}]. ` +
          `Your role: "${userRole ?? 'none'}".`,
      );
    }

    return true;
  }
}
