import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export class LocalStorageDriver {
  constructor() {
    this.uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
    this.baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
  }

  async save({ key, buffer }) {
    const fullPath = path.join(this.uploadDir, key);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    // Normalize forward slashes for URLs
    const normalizedKey = key.replace(/\\/g, '/');
    const url = `${this.baseUrl}/uploads/${normalizedKey}`;
    return { key: normalizedKey, url };
  }

  async delete({ key }) {
    if (!key) return;
    try {
      const fullPath = path.join(this.uploadDir, key);
      await fs.unlink(fullPath);
    } catch (err) {
      // Ignore if file already doesn't exist
      if (err.code !== 'ENOENT') {
        console.error('[LocalStorageDriver] Delete error:', err);
      }
    }
  }

  getUrl({ key }) {
    if (!key) return null;
    const normalizedKey = key.replace(/\\/g, '/');
    return `${this.baseUrl}/uploads/${normalizedKey}`;
  }
}
