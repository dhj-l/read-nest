import { IsNumber, IsOptional } from 'class-validator';

export class QueryChapterCheckDto {
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number;

  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number;
}
