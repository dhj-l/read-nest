import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: '角色名称必须是字符串' })
  @IsNotEmpty({ message: '角色名称不能为空' })
  @Length(1, 20, { message: '角色名称长度必须在1-20之间' })
  name: string;
  @IsString({ message: '角色值必须是字符串' })
  @IsNotEmpty({ message: '角色值不能为空' })
  @Length(2, 20, { message: '角色值长度必须在2-20之间' })
  value: string;
}
