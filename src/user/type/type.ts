import { UserStatus } from '../entities/user.entity';

export interface FindUser {
  username?: string;
  page?: number;
  pageSize?: number;
  status?: UserStatus;
}
