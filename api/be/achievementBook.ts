import { AchievementBookDTO } from '~/types/be/achievementBookType';
import { NewDailyDeclarationDTO } from '~/types/be/declarationType';
import { request } from '~/utils/request';

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
 * 成就书列表响应
 */
export interface BaseResponseListAchievementBookDTO extends BaseResponse<AchievementBookDTO[]> {}

/**
 * 布尔值响应
 */
export interface BaseResponseBoolean extends BaseResponse<boolean> {}

/**
 * 长整型响应
 */
export interface BaseResponseLong extends BaseResponse<number> {}

export const achievementBookApi = {
  /**
   * 获取成就书详情
   * @param id 成就书ID
   * @returns 返回成就书的详细信息
   */
  getAchievementBook: (id: number) => {
    return request.get<AchievementBookDTO>(`/wl/achievement-book/${id}`);
  },

  /**
   * 获取当前激活的成就书
   * @returns 返回当前激活的成就书信息
   */
  getActiveAchievementBook: () => {
    return request.get<AchievementBookDTO>('/wl/achievement-book/active');
  },

  /**
   * 更新成就书
   * @param id 成就书ID
   * @param data 更新的成就书数据
   * @returns 返回更新是否成功
   */
  updateAchievementBook: (id: string, data: AchievementBookDTO) => {
    return request.put<BaseResponseBoolean>(`/wl/achievement-book/${id}`, data);
  },

  /**
   * 创建成就书
   * @param data 成就书数据
   * @returns 返回创建成功的成就书ID
   */
  createAchievementBook: (data: AchievementBookDTO) => {
    return request.post<BaseResponseLong>('/wl/achievement-book', data);
  },

  /**
   * 删除成就书
   * @param id 成就书ID
   * @returns 返回删除是否成功
   */
  deleteAchievementBook: (id: number) => {
    return request.delete<BaseResponseBoolean>(`/wl/achievement-book/${id}`);
  },

  /**
   * 获取用户所有成就书列表
   * @param userId 用户ID
   * @returns 返回用户的所有成就书列表
   */
  getUserAchievementBooks: (userId: number) => {
    return request.get<BaseResponseListAchievementBookDTO>(`/wl/achievement-book/user/${userId}`);
  },
  getGoalsByBookId: (bookId: string) => {
    return request.get<{
      data: Array<{
        id: string;
        name: string;
        description?: string;
        status: number;
        achievementBookId: string;
      }>;
    }>('/wl/goal/list', {
      params: { bookId: bookId },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  // 创建目标在成就书
  createGoal: (data: {
    id?: string;
    bookId: string;
    title: string;
    commitment: string;
    targetQuantity: number;
    unit: string;
    purpose: string;
    attitude: string;
    actionPlan: string;
    expectedResult: string;
    completedQuantity?: number;
    completionRate?: number;
    createTime?: string;
    updateTime?: string;
  }) => {
    return request.post<BaseResponseLong>('/wl/goal', data);
  },

  // 更新目标
  updateGoal: (
    id: string,
    data: {
      bookId: string;
      title: string;
      targetQuantity: number;
      unit: string;
      purpose: string;
      attitude: string;
      actionPlan: string;
      expectedResult: string;
      completedQuantity?: number;
      completionRate?: number;
    }
  ) => {
    return request.put<BaseResponseBoolean>(`/wl/goal/${id}`, data);
  },

  // 删除目标
  deleteGoal: (id: string) => {
    return request.delete<BaseResponseBoolean>(`/wl/goal/${id}`);
  },

  // 获取成就书对应的全部日宣告 /wl/daily-declaration/list/book
  getDailyDeclarationsByBookId: (bookId: string) => {
    return request.get<NewDailyDeclarationDTO[]>(`/wl/daily-declaration/list/book`, {
      params: { bookId: bookId },
    });
  },
};
