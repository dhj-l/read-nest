import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateBookCheckDto {
  @IsNumber({}, { message: '状态必须是数字' })
  @IsNotEmpty({ message: '状态不能为空' })
  status: number;
}
