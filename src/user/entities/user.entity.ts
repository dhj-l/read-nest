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
  @Column({ length: 50, unique: true })
  username: string;
  @Column({ length: 255 })
  password: string;
  @Column({ length: 100, unique: true })
  email: string;
  @Column({ length: 255, nullable: true })
  avatar_url: string;
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
  //作品
  @OneToMany(() => Work, (work) => work.user, { cascade: true, onDelete: 'CASCADE' })
  works: Work[];
  //书架
  @OneToMany(() => BookShelf, (book_shelf) => book_shelf.user, { cascade: true, onDelete: 'CASCADE' })
  bookShelves: BookShelf[];
  //阅读记录
  @OneToMany(() => Record, (record) => record.user, { cascade: true, onDelete: 'CASCADE' })
  records: Record[];
  //书籍审核记录
  @OneToMany(() => BookCheck, (book_check) => book_check.user, { cascade: true, onDelete: 'CASCADE' })
  bookChecks: BookCheck[];
  //章节审核记录
  @OneToMany(() => ChapterCheck, (chapter_check) => chapter_check.user, { cascade: true, onDelete: 'CASCADE' })
  chapterChecks: ChapterCheck[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
