import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookCheckDto {
  @IsNumber()
  @IsNotEmpty({ message: '请选择作品' })
  workId: number;
}
