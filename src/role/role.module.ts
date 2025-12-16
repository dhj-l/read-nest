import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserModule } from 'src/user/user.module';
import { Permission } from 'src/permission/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), UserModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
