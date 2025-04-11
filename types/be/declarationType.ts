// 基础响应类型
export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 周宣告DTO
export interface WeeklyDeclarationDTO {
  id?: number;
  content: string;
  declarationDate: string; // ISO 8601 日期格式
  userId: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 日宣告DTO
export interface DailyDeclarationDTO {
  id?: number;
  content: string;
  declarationDate: string; // ISO 8601 日期格式
  userId: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 周宣告详情响应
export interface BaseResponseWeeklyDeclarationDTO extends BaseResponse<WeeklyDeclarationDTO> {}

// 日宣告详情响应
export interface BaseResponseDailyDeclarationDTO extends BaseResponse<DailyDeclarationDTO> {}

// 布尔值响应
export interface BaseResponseBoolean extends BaseResponse<boolean> {}

// 长整型响应
export interface BaseResponseLong extends BaseResponse<number> {}

// 错误响应
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}