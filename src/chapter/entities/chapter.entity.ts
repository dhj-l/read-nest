import { ChapterCheck } from 'src/chapter_check/entities/chapter_check.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  content: string;
  @Column()
  order_number: number;
  @Column()
  status: number;
  @Column()
  count: number;
  @ManyToOne(() => Work, (work) => work.chapters)
  work: Work;
  //章节审核记录
  @OneToMany(() => ChapterCheck, (chapter_check) => chapter_check.chapter)
  chapterChecks: ChapterCheck[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
