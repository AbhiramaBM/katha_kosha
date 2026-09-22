import { LocalStorageDriver } from './local.driver.js';
import { R2StorageDriver } from './r2.driver.js';
import dotenv from 'dotenv';
dotenv.config();

const driverType = process.env.STORAGE_DRIVER || 'local';

let storageInstance;
if (driverType === 'r2') {
  storageInstance = new R2StorageDriver();
} else {
  storageInstance = new LocalStorageDriver();
}

export const storage = storageInstance;
