import { IsOptional, IsNumber, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBookCheckDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  workId?: number;
}
