import { Injectable, StreamableFile } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { GetVideoDto } from './dto/get-video.dto';
import { VideoService } from './services/video.service';
import { createReadStream } from 'fs';
import { FileSystemService } from './services/file-system.service';
import { isFiveMinuteRange } from './utils/time.utils';

@Injectable()
export class AppService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly videoService: VideoService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  async getVideoFromLocationCamera(
    props: GetVideoDto,
  ): Promise<StreamableFile> {
    if (!isFiveMinuteRange(props.startDate, props.endDate)) {
      return null;
    }

    const cameraRecords = await this.s3Service.listObjects(
      'grip-lumeo-upload',
      `streams/${props.cameraId}`,
    );

    const videoKeys = cameraRecords
      .map((record) => {
        const regex = /\/(\d+)\.mp4$/;
        const match = record.match(regex);
        return {
          key: record,
          timestamp: match ? match[1] : '',
        };
      })
      .filter((obj) => obj.timestamp !== '')
      .filter((obj) => {
        const timestamp = parseInt(obj.timestamp, 10);
        return timestamp >= props.startDate && timestamp <= props.endDate;
      });

    // Download videos all at once
    const filePaths = await Promise.all(
      videoKeys.map((videoKeys) =>
        this.s3Service.downloadFile(
          'grip-lumeo-upload',
          props.cameraId,
          videoKeys.key,
        ),
      ),
    );

    const mergedVideoPath = await this.videoService.mergeVideos(
      filePaths,
      props.cameraId,
      'mp4',
    );

    await this.fileSystemService.unLinkPaths(filePaths);

    const stream = createReadStream(mergedVideoPath);
    const streamableFile = new StreamableFile(stream);

    stream.on('close', () => {
      this.fileSystemService.unLinkSync(mergedVideoPath);
    });
    return streamableFile;
  }
}
