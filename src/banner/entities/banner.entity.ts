import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BannerStatus {
  /** 下架 */
  DISABLED = 0,
  /** 上架 */
  ENABLED = 1,
  /**
   * 全部
   */
  ALL = 2,
}

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '轮播图URL' })
  imgUrl: string;

  @Column({ comment: '轮播图标题', nullable: true })
  title: string;

  @Column({
    default: BannerStatus.ENABLED,
    comment: '状态：0-下架，1-上架',
  })
  status: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
