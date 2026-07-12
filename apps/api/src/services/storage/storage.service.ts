import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../../config/env.js";

export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageService {
  uploadFile(file: Express.Multer.File): Promise<UploadResult>;
  deleteFile(key: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    // Save to apps/api/public/uploads
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    // Note: Adjusting path to resolve relative to apps/api
    this.uploadDir = path.resolve(currentDir, "../../../public/uploads");
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    this.ensureDirectoryExists();

    const fileExtension = path.extname(file.originalname);
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
    const destinationPath = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(destinationPath, file.buffer);

    return {
      url: `/uploads/${uniqueName}`,
      key: uniqueName,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete local file ${key}:`, error);
    }
  }
}

export class S3StorageService implements StorageService {
  async uploadFile(_file: Express.Multer.File): Promise<UploadResult> {
    // Skeleton implementation: in a full production setup, this would upload to S3/Cloudinary.
    // Throw error or fallback as MVP doesn't require cloud storage.
    throw new Error("S3 storage provider is not implemented for the hackathon MVP.");
  }

  async deleteFile(_key: string): Promise<void> {
    throw new Error("S3 storage provider is not implemented for the hackathon MVP.");
  }
}

export const storageService: StorageService =
  env.STORAGE_PROVIDER === "s3" ? new S3StorageService() : new LocalStorageService();
