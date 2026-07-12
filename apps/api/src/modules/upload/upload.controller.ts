import type { Request, Response } from "express";
import { sendOk, sendError } from "../../lib/response.js";
import { storageService } from "../../services/storage/storage.service.js";

export async function uploadFileController(req: Request, res: Response) {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file provided in the upload request.");
    }

    const result = await storageService.uploadFile(req.file);
    return sendOk(res, result, "File uploaded successfully.");
  } catch (error) {
    console.error("Upload error:", error);
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Failed to upload file.",
    );
  }
}
