import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class CreateWorkDto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;
  @IsNotEmpty({ message: '描述不能为空' })
  @IsString()
  description: string;
  @IsNotEmpty({ message: '封面URL不能为空' })
  @IsString({ message: '封面URL必须是字符串' })
  cover_url: string;

  @IsNotEmpty({ message: '分类不能为空' })
  @IsNumber({}, { each: true })
  category_ids: number[];
  user?: User;
}
