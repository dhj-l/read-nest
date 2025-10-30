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
  @Column({ length: 100 })
  name: string;
  @Column({ type: 'longtext' })
  content: string;
  @Column({ default: 0 })
  order_number: number;
  @Column({ default: 0 })
  status: number;
  @Column({ default: 0 })
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
