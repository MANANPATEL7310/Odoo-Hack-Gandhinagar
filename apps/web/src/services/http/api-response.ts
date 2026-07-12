export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type PaginatedData<T> = {
  data: T[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export function unwrapList<T>(payload: T[] | PaginatedData<T>): T[] {
  return Array.isArray(payload) ? payload : payload.data;
}
