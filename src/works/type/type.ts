import { WorkStatus } from '../entities/work.entity';

export enum CountLevel {
  /**
   * 所有
   */
  ALL = -1,
  /**
   * 0-30万字
   */
  LEVEL_1 = 1,
  /**
   * 30-50万字
   */
  LEVEL_2 = 2,
  /**
   * 50-80万字
   */
  LEVEL_3 = 3,
  /**
   * 80-120万字
   */
  LEVEL_4 = 4,
  /**
   * 120万字以上
   */
  LEVEL_5 = 5,
}

export interface CountRange {
  min: number;
  max: number;
}

export const CountLevelRanges: Record<CountLevel, CountRange> = {
  [CountLevel.ALL]: { min: 0, max: Infinity },
  [CountLevel.LEVEL_1]: { min: 0, max: 300000 },
  [CountLevel.LEVEL_2]: { min: 300000, max: 500000 },
  [CountLevel.LEVEL_3]: { min: 500000, max: 800000 },
  [CountLevel.LEVEL_4]: { min: 800000, max: 1200000 },
  [CountLevel.LEVEL_5]: { min: 1200000, max: Infinity },
};

export interface FindAllWorkType {
  page?: number;
  pageSize?: number;
  title?: string;
  username?: string;
  status?: WorkStatus;
  count?: CountLevel;
  category_ids?: string;
  sort?: 'DESC' | 'ASC';
}

export const FileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

export interface UploadResponse {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  url: string;
}
