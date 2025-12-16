import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { CreateBannerDto } from './create-banner.dto';
import { BannerStatus } from '../entities/banner.entity';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class UpdateBannerStatusDto {
  @IsEnum(BannerStatus, { message: '状态只能是0或1' })
  status: BannerStatus;
}
