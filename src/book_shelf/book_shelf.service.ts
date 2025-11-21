import { BadRequestException, Injectable } from '@nestjs/common';
// import { CreateBookShelfDto } from './dto/create-book_shelf.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookShelf } from './entities/book_shelf.entity';
import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import { QueryShelfDto } from './dto/query-shelf.dto';

@Injectable()
export class BookShelfService {
  constructor(
    @InjectRepository(BookShelf)
    private readonly shelfRepo: Repository<BookShelf>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Work)
    private readonly workRepo: Repository<Work>,
  ) {}

  async ensureShelf(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');
    let shelf = await this.shelfRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (shelf) return shelf;
    shelf = this.shelfRepo.create({ user });
    return await this.shelfRepo.save(shelf);
  }

  async addWork(userId: number, workId: number) {
    const shelf = await this.ensureShelf(userId);
    const work = await this.workRepo.findOne({ where: { id: workId } });
    if (!work) throw new BadRequestException('作品不存在');
    const current = await this.shelfRepo.findOne({
      where: { id: shelf.id },
      relations: ['works'],
    });
    const has = current?.works?.some((w) => w.id === workId) ?? false;
    if (has) return current;
    current!.works = [...(current?.works ?? []), work];
    return await this.shelfRepo.save(current!);
  }

  async removeWork(userId: number, workId: number) {
    const shelf = await this.ensureShelf(userId);
    const current = await this.shelfRepo.findOne({
      where: { id: shelf.id },
      relations: ['works'],
    });
    current!.works = (current?.works ?? []).filter((w) => w.id !== workId);
    await this.shelfRepo.save(current!);
    return { id: workId };
  }

  async listWorks(userId: number, query: QueryShelfDto) {
    const { page = 1, pageSize = 10 } = query;
    const shelf = await this.ensureShelf(userId);
    const qb = this.workRepo
      .createQueryBuilder('work')
      .innerJoin('work.bookShelves', 'shelf', 'shelf.id = :sid', {
        sid: shelf.id,
      })
      .select([
        'work.id',
        'work.title',
        'work.cover_url',
        'work.readCount',
        'work.status',
      ])
      .orderBy('work.id', 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { data, total, page, pageSize };
  }

  async getShelf(userId: number) {
    const shelf = await this.shelfRepo.findOne({
      where: { user: { id: userId } },
      relations: ['works'],
    });
    if (!shelf) return await this.ensureShelf(userId);
    return shelf;
  }
}
