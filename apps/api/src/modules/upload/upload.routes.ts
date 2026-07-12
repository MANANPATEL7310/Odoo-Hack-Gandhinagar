import multer from "multer";
import { createRouter } from "../../lib/create-router.js";
import { uploadFileController } from "./upload.controller.js";
import { requireAuth } from "../../middleware/require-auth.js";

export const uploadRouter = createRouter();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

uploadRouter.post("/", requireAuth, upload.single("file"), uploadFileController);
