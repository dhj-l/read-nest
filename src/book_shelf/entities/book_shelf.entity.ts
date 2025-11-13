import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';

@Entity()
export class BookShelf {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.bookShelf, { onDelete: 'CASCADE' })
  user: User;

  @ManyToMany(() => Work, (work) => work.bookShelves, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'book_shelf_work',
  })
  works: Work[];

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
