import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Service } from './services/s3.service';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from './services/video.service';
import { FileSystemService } from './services/file-system.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, S3Service, VideoService, FileSystemService],
})
export class AppModule {}
