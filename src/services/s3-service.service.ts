import { Injectable } from '@nestjs/common';
import {
  ListObjectsV2Command,
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { FileSystemService } from './file-system.service';

@Injectable()
export class S3ServiceService {
  private s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly fileSystemService: FileSystemService,
  ) {
    this.s3Client = new S3Client({
      region: configService.get<string>('S3_AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('S3_ACCESS_KEY'),
        secretAccessKey: configService.get<string>('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async listObjects(bucketName: string, prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    try {
      const response = await this.s3Client.send(command);
      return response.Contents
        ? response.Contents.map((item) => item.Key || '')
        : [];
    } catch (err) {
      return [];
    }
  }

  async downloadFile(
    bucketName: string,
    cameraId: string,
    key: string,
  ): Promise<string> {
    this.fileSystemService.ensureDirectoryExists(
      `${this.fileSystemService.getTempDir()}/${cameraId}`,
    );

    const filePath = path.join(
      this.fileSystemService.getTempDir(),
      cameraId,
      path.basename(key),
    );

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await this.s3Client.send(command);

    if (!(Body instanceof Readable)) {
      throw new Error('The response body is not a readable stream.');
    }

    await new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);

      writeStream.on('error', reject);
      Body.on('error', reject);
      Body.on('close', resolve);

      Body.pipe(writeStream);
    });

    return filePath;
  }
}
