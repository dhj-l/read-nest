import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateChapterDto {
  @IsNotEmpty({ message: '请输入章节名称' })
  @IsString({ message: '章节名称必须是字符串' })
  @Length(1, 30, { message: '章节名称长度必须在1-30之间' })
  name: string;
  @IsNotEmpty({ message: '请输入章节内容' })
  @IsString({ message: '章节内容必须是字符串' })
  content: string;
}
