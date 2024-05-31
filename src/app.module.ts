import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3ServiceService } from './services/s3-service.service';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from './services/video.service';
import { FileSystemService } from './services/file-system.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, S3ServiceService, VideoService, FileSystemService],
})
export class AppModule {}
