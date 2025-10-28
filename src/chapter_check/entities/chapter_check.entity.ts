import { User } from 'src/user/entities/user.entity';
import { Chapter } from 'src/chapter/entities/chapter.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChapterCheck {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.chapterChecks)
  user: User;
  @ManyToOne(() => Chapter, (chapter) => chapter.chapterChecks)
  chapter: Chapter;
  @Column()
  status: number;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
