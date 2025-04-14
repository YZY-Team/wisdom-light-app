/**
 * 成就书DTO
 */
export interface AchievementBookDTO {
  /** 唯一标识符 */
  id?: string;
  /** 用户ID */
  userId?: string;
  /** 内容 */
  content?: string;
  /** 誓言 */
  oath?: string;
  /** 承诺 */
  promise?: string;
  /** 是否激活 */
  isActive?: boolean;
  /** 会员开始时间 */
  membershipStartDate?: string;
  /** 会员结束时间 */
  membershipEndDate?: string;
  /** 教练ID列表 */
  coachIds?: string[];
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}