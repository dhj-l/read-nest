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
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Work {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  count: number;
  @Column()
  description: string;
  @ManyToOne(() => User, (user) => user.works)
  user: User;
  @ManyToOne(() => Category, (category) => category.works)
  category: Category;
  @OneToMany(() => Chapter, (chapter) => chapter.work)
  chapters: Chapter[];
  //书架
  @OneToMany(() => BookShelf, (book_shelf) => book_shelf.work)
  bookShelves: BookShelf[];
  //阅读记录
  @OneToMany(() => Record, (record) => record.work)
  records: Record[];
  //审核记录
  @OneToMany(() => BookCheck, (book_check) => book_check.work)
  bookChecks: BookCheck[];
  @Column()
  status: number;
  @Column()
  cover_url: string;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
