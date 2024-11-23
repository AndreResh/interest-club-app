import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      accessKeyId: process.env.MINIO_ROOT_USER || 'andrew123',
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'andrew123',
      s3ForcePathStyle: true, // Для совместимости с MinIO
      signatureVersion: 'v4',
    });
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const bucketName = 'media';

    // Создание bucket, если не существует
    await this.s3.headBucket({ Bucket: bucketName }).promise().catch(async () => {
      await this.s3.createBucket({ Bucket: bucketName }).promise();
    });

    const uniqueFileName = `${uuidv4()}-${fileName}`;
    await this.s3
      .putObject({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
      })
      .promise();

    return `${bucketName}/${uniqueFileName}`;
  }

  async getFileUrl(fileKey: string): Promise<string> {
    const bucketName = 'media';
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: fileKey,
      Expires: 60 * 60,
    });
  }
}
