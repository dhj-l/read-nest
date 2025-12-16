import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;
  /** 权限名称 */
  @Column()
  name: string;
  /** 权限值 */
  @Column({ unique: true })
  value: string;
  /** 权限描述 */
  @Column()
  description: string;
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
  /** 创建时间 */
  @CreateDateColumn()
  createTime: Date;
  /** 更新时间 */
  @UpdateDateColumn()
  updateTime: Date;
}
