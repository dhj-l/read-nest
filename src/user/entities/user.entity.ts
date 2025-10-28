import { BookCheck } from 'src/book_check/entities/book_check.entity';
import { BookShelf } from 'src/book_shelf/entities/book_shelf.entity';
import { ChapterCheck } from 'src/chapter_check/entities/chapter_check.entity';
import { Record } from 'src/record/entities/record.entity';
import { Role } from 'src/role/entities/role.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column()
  email: string;
  @Column()
  avatar_url: string;
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
  //作品
  @OneToMany(() => Work, (work) => work.user)
  works: Work[];
  //书架
  @OneToMany(() => BookShelf, (book_shelf) => book_shelf.user)
  bookShelves: BookShelf[];
  //阅读记录
  @OneToMany(() => Record, (record) => record.user)
  records: Record[];
  //书籍审核记录
  @OneToMany(() => BookCheck, (book_check) => book_check.user)
  bookChecks: BookCheck[];
  //章节审核记录
  @OneToMany(() => ChapterCheck, (chapter_check) => chapter_check.user)
  chapterChecks: ChapterCheck[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
