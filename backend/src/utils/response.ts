// Pattern: Factory
import type { ValidationError } from 'yup';

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

export interface ErrorDetail {
  path?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetail[];
}

/**
 * Builds a standard success response payload.
 * @param message - Human-readable success message
 * @param data - Optional payload
 */
export const success = <T>(message: string, data?: T): SuccessResponse<T> => ({
  success: true,
  message,
  ...(data !== undefined && { data }),
});

/**
 * Builds a standard error response payload.
 * @param message - Human-readable error message
 * @param errors - Optional list of detailed errors (e.g. Yup ValidationError[])
 */
export const apiError = (message: string, errors?: ValidationError[] | ErrorDetail[]): ErrorResponse => {
  const normalized: ErrorDetail[] | undefined = errors?.map((e) =>
    'inner' in e
      ? { path: e.path, message: e.message }
      : { path: e.path, message: e.message }
  );
  return {
    success: false,
    message,
    ...(normalized?.length && { errors: normalized }),
  };
};
