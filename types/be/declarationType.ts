/**
 * 周目标DTO
 */
export interface WeeklyGoalDTO {
  /** 唯一标识符 */
  id: number | null;
  /** 目标ID */
  goalId: string;
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
 * 周宣告DTO
 */
export interface WeeklyDeclarationDTO {
  /** 唯一标识符 */
  id: string;
  /** 用户ID */
  userId: string;
  /** 书籍ID */
  bookId: string;
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
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 日目标DTO
 */
export interface DailyGoalDTO {
  /** 唯一标识符 */
  id?: number;
  /** 目标ID */
  goalId: number;
  /** 目标标题 */
  title: string;
  /** 目标单位 */
  unit: string;
  /** 当日完成数量 */
  completedQuantity: number;
  /** 本周目标数量 */
  weeklyTargetQuantity: number;
  /** 本周已完成数量 */
  weeklyCompletedQuantity: number;
  /** 总目标数量 */
  totalTargetQuantity: number;
  /** 总完成数量 */
  totalCompletedQuantity: number;
  /** 周完成率 */
  weeklyCompletionRate: number;
  /** 总完成率 */
  totalCompletionRate: number;
}

/**
 * 新的日宣告DTO
 */
export interface NewDailyDeclarationDTO {
  /** 唯一标识符 */
  id?: string;
  /** 用户ID */
  userId: string;
  /** 书籍ID */
  bookId: string;
  /** 关联的周宣告ID */
  weeklyDeclarationId: string;
  /** 当前是第几天 */
  dayNumber: number;
  /** 宣告日期 */
  declarationDate: string;
  /** 早晨计划 */
  morningPlan: string;
  /** 中午计划 */
  noonPlan: string;
  /** 下午计划 */
  afternoonPlan: string;
  /** 晚上计划 */
  eveningPlan: string;
  /** 当日评分 */
  dayScore: string;
  /** 当日体验 */
  dayExperience: string;
  /** 什么有效 */
  whatWorked: string;
  /** 什么无效 */
  whatDidntWork: string;
  /** 学到了什么 */
  whatLearned: string;
  /** 下一步是什么 */
  whatNext: string;
  /** 日目标列表 */
  dailyGoals: DailyGoalDTO[];
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}
