import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty({ message: '请输入作品id' })
  @IsNumber({}, { message: '作品id必须是数字' })
  workId: number;
  @IsNotEmpty({ message: '请输入章节id' })
  @IsNumber({}, { message: '章节id必须是数字' })
  chapterId: number;
}

export class FindRecordDto {
  @IsOptional()
  @IsNotEmpty({ message: '请输入页码' })
  @IsNumber({}, { message: '页码必须是数字' })
  page: number;
  @IsOptional()
  @IsNotEmpty({ message: '请输入每页数量' })
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize: number;
}
