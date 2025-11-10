import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  name: string;
  @IsNotEmpty({ message: '分类描述不能为空' })
  @IsString({ message: '分类描述必须是字符串' })
  description: string;
}
