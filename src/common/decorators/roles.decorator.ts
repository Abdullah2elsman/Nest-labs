import { SetMetadata } from '@nestjs/common';

/** Decorator to declare required roles on a route/controller */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
