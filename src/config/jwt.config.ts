import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-key-qba-bms-2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
