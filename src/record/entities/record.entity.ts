import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import { Chapter } from 'src/chapter/entities/chapter.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.records, { onDelete: 'CASCADE' })
  user: User;
  @ManyToOne(() => Work, (work) => work.records, { onDelete: 'CASCADE' })
  work: Work;
  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  chapter: Chapter;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
