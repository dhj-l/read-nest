import { BookCheck } from 'src/book_check/entities/book_check.entity';
import { BookShelf } from 'src/book_shelf/entities/book_shelf.entity';
import { Category } from 'src/category/entities/category.entity';
import { Chapter } from 'src/chapter/entities/chapter.entity';
import { Record } from 'src/record/entities/record.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Work {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 100, unique: true })
  title: string;
  @Column({ default: 0 })
  count: number;
  @Column({ type: 'text', nullable: true })
  description: string;
  @ManyToOne(() => User, (user) => user.works)
  user: User;
  @ManyToMany(() => Category, (category) => category.works)
  @JoinTable({ name: 'work_category' })
  categorys: Category[];
  @OneToMany(() => Chapter, (chapter) => chapter.work, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  //章节
  chapters: Chapter[];
  //书架
  @OneToMany(() => BookShelf, (book_shelf) => book_shelf.work, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  bookShelves: BookShelf[];
  //阅读记录
  @OneToMany(() => Record, (record) => record.work, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  records: Record[];
  //审核记录
  @OneToMany(() => BookCheck, (book_check) => book_check.work, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  bookChecks: BookCheck[];
  @Column({ default: 0 })
  //状态 0 未审核 1 已审核 2 已拒绝
  status: number;
  @Column()
  cover_url: string;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
