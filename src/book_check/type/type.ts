import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';

export interface CreateBookCheckType {
  work: Work;
  user: User;
}
