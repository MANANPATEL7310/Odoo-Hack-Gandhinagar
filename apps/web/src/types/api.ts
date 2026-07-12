export type ApiError = {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
};
