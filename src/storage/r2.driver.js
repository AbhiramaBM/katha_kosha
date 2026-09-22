import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

export class R2StorageDriver {
  constructor() {
    this.bucket = process.env.R2_BUCKET;
    this.publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (accountId && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
    }
  }

  async save({ key, buffer, mimeType }) {
    if (!this.client) {
      throw new Error('R2 storage client is not configured. Check R2 credentials in environment variables.');
    }

    const normalizedKey = key.replace(/\\/g, '/');
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
      Body: buffer,
      ContentType: mimeType
    });

    await this.client.send(command);
    const url = `${this.publicUrl}/${normalizedKey}`;
    return { key: normalizedKey, url };
  }

  async delete({ key }) {
    if (!this.client || !key) return;
    const normalizedKey = key.replace(/\\/g, '/');
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalizedKey
      });
      await this.client.send(command);
    } catch (err) {
      console.error('[R2StorageDriver] Delete error:', err);
    }
  }

  getUrl({ key }) {
    if (!key) return null;
    const normalizedKey = key.replace(/\\/g, '/');
    return `${this.publicUrl}/${normalizedKey}`;
  }
}
