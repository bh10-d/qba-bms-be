import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export type RoleRequirement = UserRole | number | string;

export const Roles = (...roles: RoleRequirement[]) => SetMetadata(ROLES_KEY, roles);
