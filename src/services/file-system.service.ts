import { Injectable } from '@nestjs/common';
import { resolve as resolvePath } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class FileSystemService {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = resolvePath(__dirname, '..', '..', './.temp');
    this.ensureDirectoryExists(this.tempDir);
  }

  ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }

  async unLinkPaths(paths: string[]) {
    await Promise.all(paths.map((path) => unlink(path)));
  }

  async unLinkSync(path: string): Promise<void> {
    return await unlink(path);
  }

  getTempDir(): string {
    return this.tempDir;
  }
}
