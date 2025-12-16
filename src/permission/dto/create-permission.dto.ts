import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreatePermissionDto {
  @IsString({ message: '权限名称必须是字符串' })
  @IsNotEmpty({ message: '权限名称不能为空' })
  @Length(1, 20, { message: '权限名称长度必须在1-20之间' })
  name: string;
  
  @IsString({ message: '权限值必须是字符串' })
  @IsNotEmpty({ message: '权限值不能为空' })
  @Length(2, 20, { message: '权限值长度必须在2-20之间' })
  value: string;
  
  @IsString({ message: '权限描述必须是字符串' })
  @IsNotEmpty({ message: '权限描述不能为空' })
  @Length(1, 100, { message: '权限描述长度必须在1-100之间' })
  description: string;
}
