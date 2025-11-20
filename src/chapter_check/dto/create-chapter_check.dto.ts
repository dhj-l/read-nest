import { IsNotEmpty } from 'class-validator';

export class CreateChapterCheckDto {
  @IsNotEmpty({ message: '请输入章节id' })
  chapterId: number;
}
