import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['user', 'work']) // 确保用户不会重复收藏同一作品
export class BookShelf {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bookShelves, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Work, (work) => work.bookShelves, { onDelete: 'CASCADE' })
  work: Work;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '收藏状态：1-在读，2-已读，3-想读',
  })
  reading_status: number;

  @Column({ type: 'int', default: 0, comment: '阅读进度百分比' })
  progress: number;

  @Column({ type: 'timestamp', nullable: true, comment: '最后阅读时间' })
  last_read_time: Date;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
