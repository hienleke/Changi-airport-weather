import { Router, Request, Response, NextFunction } from 'express';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BaseRouter {
  protected router: Router;

  constructor() {
    this.router = Router();
  }

  protected getPaginationParams(req: Request): PaginationParams {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    return {
      page,
      limit,
      sortBy,
      sortOrder,
    };
  }

  protected createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
  ): PaginatedResponse<T> {
    const { page, limit } = params;
    return {
      data,
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  public getRouter(): Router {
    return this.router;
  }
} 