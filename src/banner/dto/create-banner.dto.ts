import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { BannerStatus } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsNotEmpty({ message: '轮播图URL不能为空' })
  @IsString({ message: '轮播图URL必须是字符串' })
  imgUrl: string;

  @IsString({ message: '轮播图标题必须是字符串' })
  title?: string;

  @IsOptional()
  @IsEnum(BannerStatus, { message: '状态只能是0或1' })
  status?: BannerStatus;
}
