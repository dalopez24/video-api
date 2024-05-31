import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { GetVideoDto } from './dto/get-video.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'video/mp4')
  async getVideoFromTimestamps(
    @Query() params: GetVideoDto,
  ): Promise<StreamableFile> {
    return await this.appService.getVideoFromLocationCamera(params);
  }
}
