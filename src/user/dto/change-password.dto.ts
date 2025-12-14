import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: '原密码不能为空' })
  @IsString({ message: '原密码必须是字符串' })
  @MinLength(6, { message: '原密码长度不能少于6个字符' })
  oldPassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度不能少于6个字符' })
  @MaxLength(50, { message: '新密码长度不能超过50个字符' })
  newPassword: string;

  @IsNotEmpty({ message: '确认新密码不能为空' })
  @IsString({ message: '确认新密码必须是字符串' })
  @MinLength(6, { message: '确认新密码长度不能少于6个字符' })
  @MaxLength(50, { message: '确认新密码长度不能超过50个字符' })
  confirmPassword: string;
}
