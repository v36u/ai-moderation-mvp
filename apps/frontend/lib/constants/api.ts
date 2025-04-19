export type ApiSuccessfulResponse<TData> = {
  success: true;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type ApiResponse<TData> =
  | ApiSuccessfulResponse<TData>
  | ApiErrorResponse;
