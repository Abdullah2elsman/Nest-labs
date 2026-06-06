import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * AuthGuard — validates the Authorization header.
 *
 * Expects the header:  Authorization: Bearer <token>
 *
 * In this learning project, any non-empty token is accepted.
 * In production you would verify a JWT here.
 *
 * Usage:
 *   @UseGuards(AuthGuard)            ← on controller or route
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header. Expected: Bearer <token>',
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      throw new UnauthorizedException('Token must not be empty.');
    }

    // Attach decoded user info to request for downstream use
    // In a real app: verify JWT and attach the payload
    (request as any).user = { token };
    return true;
  }
}
