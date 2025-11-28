import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
// no enum import, status is numeric now

export class CreateChapterDto {
  @IsNotEmpty({ message: '请输入章节名称' })
  @IsString({ message: '章节名称必须是字符串' })
  @Length(1, 30, { message: '章节名称长度必须在1-30之间' })
  name: string;
  @IsNotEmpty({ message: '请输入章节内容' })
  @IsString({ message: '章节内容必须是字符串' })
  content: string;
}

export class FindChapterDto {
  @IsOptional()
  @IsNumber({}, { message: '工作id必须是数字' })
  workId?: number;
  @IsOptional()
  @IsNumber({}, { message: '章节状态必须是数字' })
  status?: number;
  @IsOptional()
  @IsString({ message: '章节名称必须是字符串' })
  name?: string;
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number;
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number;
  //是否查询全部章节
  @IsOptional()
  @IsNumber({}, { message: '是否查询全部章节必须是数字' })
  all?: number;
}
