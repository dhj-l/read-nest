import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBannerDto } from './dto/create-banner.dto';
import {
  UpdateBannerDto,
  UpdateBannerStatusDto,
} from './dto/update-banner.dto';
import { Banner, BannerStatus } from './entities/banner.entity';
import { FindAllBannerDto } from './dto/find-list.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
  ) {}

  /**
   * 创建轮播图
   */
  async create(createBannerDto: CreateBannerDto) {
    const banner = this.bannerRepository.create(createBannerDto);
    return await this.bannerRepository.save(banner);
  }

  /**
   * 查询轮播图列表
   */
  async findAll(findAllBannerDto: FindAllBannerDto) {
    const {
      status = BannerStatus.ALL,
      page = 1,
      pageSize = 10,
    } = findAllBannerDto;

    const [banners, total] = await this.bannerRepository.findAndCount({
      where: {
        status: status === BannerStatus.ALL ? undefined : status,
      },
      order: {
        createTime: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: banners,
      total,
    };
  }

  /**
   * 根据ID查询单个轮播图
   */
  async findOne(id: number) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    return banner;
  }

  /**
   * 更新轮播图
   */
  async update(id: number, updateBannerDto: UpdateBannerDto) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    await this.bannerRepository.update(id, updateBannerDto);

    return await this.bannerRepository.findOne({
      where: { id },
    });
  }

  /**
   * 更新轮播图状态
   */
  async updateStatus(id: number, updateStatusDto: UpdateBannerStatusDto) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    if (
      ![BannerStatus.ENABLED, BannerStatus.DISABLED].includes(
        updateStatusDto.status,
      )
    ) {
      throw new ConflictException('状态只能是0或1');
    }

    banner.status = updateStatusDto.status;
    return await this.bannerRepository.save(banner);
  }

  /**
   * 删除轮播图
   */
  async remove(id: number) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    await this.bannerRepository.remove(banner);

    return {
      message: '轮播图删除成功',
      id,
    };
  }
}
