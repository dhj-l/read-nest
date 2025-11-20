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
import { IsIn } from 'class-validator';

export enum ChapterCheckStatus {
  /**待审核 */
  Pending = 0,
  /**审核通过 */
  Approved = 1,
  /**审核不通过 */
  Rejected = 2,
}
@Entity()
export class ChapterCheck {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, (user) => user.chapterChecks, { onDelete: 'CASCADE' })
  user: User;
  @ManyToOne(() => Chapter, (chapter) => chapter.chapterChecks, {
    onDelete: 'CASCADE',
  })
  chapter: Chapter;
  @Column({
    type: 'tinyint',
    default: ChapterCheckStatus.Pending,
  })
  @IsIn([
    ChapterCheckStatus.Pending,
    ChapterCheckStatus.Approved,
    ChapterCheckStatus.Rejected,
  ])
  status: number;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
