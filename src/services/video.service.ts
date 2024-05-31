import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemService } from './file-system.service';

@Injectable()
export class VideoService {
  constructor(private readonly fileSystemService: FileSystemService) {}

  async mergeVideos(
    videoPaths: string[],
    cameraId: string,
    extension: string,
  ): Promise<string> {
    const mergeVideoPathFile = `${this.fileSystemService.getTempDir()}/${cameraId}/${uuidv4()}.${extension}`;
    return new Promise((resolve) => {
      let command = ffmpeg();

      // Add all video paths to the command
      videoPaths.forEach((path) => {
        command = command.addInput(path);
      });

      command
        .mergeToFile(mergeVideoPathFile)
        .on('end', () => resolve(mergeVideoPathFile))
        .on('error', (error) => {
          console.error(error); // or handle error as needed
          resolve(null);
        });
    });
  }
}
