import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Storage, PutObjectInput, StoredObject, ObjectMetadata } from '@bh10-d/storix';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private storage: Storage;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const { Storage, LocalStorageDriver, MinIOStorageDriver } = await import('@bh10-d/storix');
    const driverType = this.configService.get<string>('STORAGE_DRIVER', 'local');

    if (driverType === 'minio') {
      this.logger.log('📦 Khởi tạo Storage Engine: MinIO Driver (@bh10-d/storix)...');
      const driver = new MinIOStorageDriver({
        endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
        port: this.configService.get<number>('MINIO_PORT', 9000),
        useSSL: this.configService.get<boolean>('MINIO_USE_SSL', false),
        accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
        bucket: this.configService.get<string>('MINIO_BUCKET', 'qba-bms-filestore'),
      });
      this.storage = new Storage(driver);
    } else {
      const rootPath = path.join(process.cwd(), 'uploads');
      this.logger.log(`📁 Khởi tạo Storage Engine: Local Filesystem Driver (@bh10-d/storix) tại [${rootPath}]...`);
      const driver = new LocalStorageDriver({
        root: rootPath,
      });
      this.storage = new Storage(driver);
    }
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    return this.storage.put(input);
  }

  async get(key: string): Promise<Readable> {
    return this.storage.get(key);
  }

  async delete(key: string): Promise<void> {
    return this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.exists(key);
  }

  async metadata(key: string): Promise<ObjectMetadata> {
    return this.storage.metadata(key);
  }

  async list(options?: { prefix?: string }): Promise<ObjectMetadata[]> {
    return this.storage.list(options);
  }
}
