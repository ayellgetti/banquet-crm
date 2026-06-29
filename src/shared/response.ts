export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export function successResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(message: string, errors?: string[]): ErrorResponse {
  return { success: false, message, ...(errors ? { errors } : {}) };
}
