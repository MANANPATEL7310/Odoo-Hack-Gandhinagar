import type { Request, Response } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { sendOk, sendCreated } from "../../lib/response.js";
import * as categoriesService from "./asset-categories.service.js";

export const listCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const list = await categoriesService.listCategories();
    return sendOk(res, list, "Asset categories retrieved successfully.");
  },
);

export const createCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await categoriesService.createCategory(req.body);
    return sendCreated(res, category, "Asset category created successfully.");
  },
);

export const updateCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await categoriesService.updateCategory(
      req.params.id as string,
      req.body,
    );
    return sendOk(res, category, "Asset category updated successfully.");
  },
);

export const deleteCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    await categoriesService.deleteCategory(req.params.id as string);
    return sendOk(res, null, "Asset category deleted successfully.");
  },
);
