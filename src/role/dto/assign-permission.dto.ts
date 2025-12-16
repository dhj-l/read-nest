import { IsArray, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class AssignPermissionDto {
  @IsNumber({}, { message: '角色ID必须是数字' })
  @IsPositive({ message: '角色ID必须是正数' })
  @IsNotEmpty({ message: '角色ID不能为空' })
  roleId: number;

  @IsArray({ message: '权限ID必须是数组' })
  @IsNotEmpty({ message: '权限ID数组不能为空' })
  permissionIds: number[];
}