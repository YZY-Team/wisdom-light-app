/**
 * 基础响应类型
 * @template T 响应数据类型
 */
export interface BaseResponse<T> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应消息 */
  message?: string;
  /** 响应数据 */
  data: T;
}

/**
 * 周宣告DTO
 */
export interface WeeklyDeclarationDTO {
  /** 唯一标识符 */
  id?: number;
  /** 宣告内容 */
  content: string;
  /** ISO 8601 日期格式的宣告日期 */
  declarationDate: string; // ISO 8601 日期格式
  /** 用户ID */
  userId: number;
  /** 是否已完成 */
  isCompleted?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 日宣告DTO
 */
export interface DailyDeclarationDTO {
  /** 唯一标识符 */
  id?: number;
  /** 宣告内容 */
  content: string;
  /** ISO 8601 日期格式的宣告日期 */
  declarationDate: string; // ISO 8601 日期格式
  /** 用户ID */
  userId: number;
  /** 是否已完成 */
  isCompleted?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 周宣告详情响应
 */
export interface BaseResponseWeeklyDeclarationDTO extends BaseResponse<WeeklyDeclarationDTO> {}

/**
 * 日宣告详情响应
 */
export interface BaseResponseDailyDeclarationDTO extends BaseResponse<DailyDeclarationDTO> {}

/**
 * 布尔值响应
 */
export interface BaseResponseBoolean extends BaseResponse<boolean> {}

/**
 * 长整型响应
 */
export interface BaseResponseLong extends BaseResponse<number> {}

/**
 * 错误响应
 */
export interface ErrorResponse {
  /** 错误发生时间戳 */
  timestamp: string;
  /** HTTP状态码 */
  status: number;
  /** 错误类型 */
  error: string;
  /** 错误消息 */
  message: string;
  /** 请求路径 */
  path: string;
}

/**
 * 周目标DTO
 */
export interface WeeklyGoalDTO {
  /** 唯一标识符 */
  id?: number;
  /** 目标ID */
  goalId: number;
  /** 目标标题 */
  title: string;
  /** 目标单位 */
  unit: string;
  /** 目标数量 */
  targetQuantity: number;
  /** 已完成数量 */
  completedQuantity: number;
  /** 完成率 */
  completionRate: number;
}

/**
 * 新的周宣告DTO，包含更详细的字段
 */
export interface NewWeeklyDeclarationDTO {
  /** 唯一标识符 */
  id?: number;
  /** 用户ID */
  userId: number;
  /** 书籍ID */
  bookId: number;
  /** 周数 */
  weekNumber: number;
  /** 标题 */
  title: string;
  /** 宣告内容 */
  declarationContent: string;
  /** 周开始日期 */
  weekStartDate: string;
  /** 周结束日期 */
  weekEndDate: string;
  /** 成就 */
  achievement: string;
  /** 自我总结 */
  selfSummary: string;
  /** 123456总结法 */
  summary123456: string;
  /** 下一步计划 */
  nextStep: string;
  /** 本周评分 */
  weekScore: string;
  /** 本周体验 */
  weekExperience: string;
  /** 什么有效 */
  whatWorked: string;
  /** 什么无效 */
  whatDidntWork: string;
  /** 学到了什么 */
  whatLearned: string;
  /** 下一步是什么 */
  whatNext: string;
  /** 周目标列表 */
  weeklyGoals: WeeklyGoalDTO[];
  /** 平均完成率 */
  averageCompletionRate: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 新的周宣告详情响应
 */
export interface BaseResponseNewWeeklyDeclarationDTO extends BaseResponse<NewWeeklyDeclarationDTO> {}