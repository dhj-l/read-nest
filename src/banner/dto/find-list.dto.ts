import { IsInt, IsOptional } from 'class-validator';
import { IsEnum } from 'class-validator';
import { BannerStatus } from '../entities/banner.entity';

export class FindAllBannerDto {
  @IsOptional()
  @IsEnum(BannerStatus)
  status: BannerStatus;
  @IsOptional()
  @IsInt()
  page: number;
  @IsOptional()
  @IsInt()
  pageSize: number;
}
