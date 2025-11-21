import { IsNumber } from 'class-validator';

export class AddWorkDto {
  @IsNumber({}, { message: '作品ID必须是数字' })
  workId: number;
}
