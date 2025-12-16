import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import {
  UpdateBannerDto,
  UpdateBannerStatusDto,
} from './dto/update-banner.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { BannerInterceptor } from './banner.interceptor';
import { FindAllBannerDto } from './dto/find-list.dto';

@Controller('banner')
@UseInterceptors(BannerInterceptor)
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  /**
   * 创建轮播图
   */
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createBannerDto: CreateBannerDto) {
    return await this.bannerService.create(createBannerDto);
  }

  /**
   * 查询轮播图列表
   */
  @Get('list')
  async findAll(@Query() findAllBannerDto: FindAllBannerDto) {
    return await this.bannerService.findAll(findAllBannerDto);
  }

  /**
   * 根据ID查询单个轮播图
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.bannerService.findOne(+id);
  }

  /**
   * 更新轮播图
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return await this.bannerService.update(+id, updateBannerDto);
  }

  /**
   * 修改轮播图状态
   */
  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBannerStatusDto,
  ) {
    return await this.bannerService.updateStatus(+id, updateStatusDto);
  }

  /**
   * 删除轮播图
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.bannerService.remove(+id);
  }
}
