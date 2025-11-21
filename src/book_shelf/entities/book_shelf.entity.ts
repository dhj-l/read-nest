import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class BookShelf {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.bookShelf, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToMany(() => Work, (work) => work.bookShelves, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'book_shelf_work',
  })
  works: Work[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
