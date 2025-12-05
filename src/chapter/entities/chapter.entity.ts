import { IsIn } from 'class-validator';
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

export enum ChapterStatus {
  /**待审核 */
  Pending = 0,
  /**
   * 已上架
   */
  Approved = 1,
  /**
   * 已下架
   */
  Rejected = 2,
}
@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100 })
  name: string;
  @Column({ type: 'longtext' })
  content: string;
  @Column({ type: 'longtext', nullable: true })
  contentHtml: string;
  @Column({ type: 'tinyint', default: ChapterStatus.Pending })
  @IsIn([ChapterStatus.Pending, ChapterStatus.Approved, ChapterStatus.Rejected])
  status: number;
  @Column({ default: 0 })
  count: number;
  @ManyToOne(() => Work, (work) => work.chapters, { onDelete: 'CASCADE' })
  work: Work;
  //章节审核记录
  @OneToMany(() => ChapterCheck, (chapter_check) => chapter_check.chapter)
  chapterChecks: ChapterCheck[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
