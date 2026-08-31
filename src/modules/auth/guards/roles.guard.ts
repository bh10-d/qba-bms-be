import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleRequirement } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

// Bảng ánh xạ mặc định từ Enum Role sang Trọng số Level tối thiểu
export const ROLE_LEVEL_MAP: Record<string, number> = {
  [UserRole.SUPERADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MANAGER]: 60,
  [UserRole.STAFF]: 40,
  [UserRole.USER]: 20,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleRequirement[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole = user?.role;

    if (!user || !userRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
    }

    // SUPERADMIN (hoặc bất kỳ ai có level >= 100) luôn có toàn quyền truy cập
    if (userRole.code === UserRole.SUPERADMIN || userRole.level >= 100) {
      return true;
    }

    // 1. Kiểm tra trực tiếp theo Mã Code vai trò (nếu khai báo khớp mã code)
    const hasExactCodeMatch = requiredRoles.some(
      (req) => typeof req === 'string' && req.toUpperCase() === userRole.code,
    );
    if (hasExactCodeMatch) {
      return true;
    }

    // 2. Kiểm tra ĐỘNG theo Cấp bậc Level (Tất cả Role Động có Level >= Level tối thiểu của API đều ĐƯỢC PHÉP)
    const minRequiredLevel = Math.min(
      ...requiredRoles.map((req) => {
        if (typeof req === 'number') return req;
        return ROLE_LEVEL_MAP[req] ?? 20;
      }),
    );

    if (userRole.level >= minRequiredLevel) {
      return true;
    }

    throw new ForbiddenException(
      `Yêu cầu cấp bậc tối thiểu Level ${minRequiredLevel}. Vai trò của bạn là ${userRole.name} (Level ${userRole.level})`,
    );
  }
}
