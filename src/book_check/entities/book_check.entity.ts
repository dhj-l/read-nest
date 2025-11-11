import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BookCheck {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.bookChecks)
  user: User;
  @ManyToOne(() => Work, (work) => work.bookChecks, {
    onDelete: 'CASCADE',
  })
  work: Work;
  @Column({ default: 0 })
  // 0 待审核 1 审核通过 2 审核拒绝
  status: number;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
