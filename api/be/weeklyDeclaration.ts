import { request } from '~/utils/request';
import {
  WeeklyDeclarationDTO,
} from '~/types/be/declarationType';

export const weeklyDeclarationApi = {
  /**
   * 获取指定成就书的所有周宣告
   * @param bookId 成就书ID
   * @returns 返回周宣告列表
   */
  getWeeklyDeclarationList: (bookId: string) => {
    return request.get<WeeklyDeclarationDTO[]>('/wl/weekly-declaration/list', {
      params: { bookId },
    });
  },

  /**
   * 获取当前周的周宣告
   * @param bookId 成就书ID
   * @returns 返回当前周的周宣告
   */
  getCurrentWeeklyDeclaration: (bookId: string) => {
    return request.get<WeeklyDeclarationDTO>('/wl/weekly-declaration/current', {
      params: { bookId },
    });
  },

  /**
   * 创建周宣告
   * @param data 周宣告数据，包含宣告内容、日期等信息
   * @returns 返回创建成功的周宣告ID
   */
  createWeeklyDeclaration: (data: WeeklyDeclarationDTO) => {
    return request.post<WeeklyDeclarationDTO>('/wl/weekly-declaration', data);
  },

  /**
   * 获取周宣告详情
   * @param id 周宣告ID
   * @returns 返回周宣告的详细信息
   */
  getWeeklyDeclarationDetail: (id: number) => {
    return request.get<WeeklyDeclarationDTO>(`/wl/weekly-declaration/${id}`);
  },

  /**
   * 更新周宣告
   * @param id 周宣告ID
   * @param data 更新的周宣告数据
   * @returns 返回更新是否成功
   */
  updateWeeklyDeclaration: (id: string, data: WeeklyDeclarationDTO) => {
    return request.patch<WeeklyDeclarationDTO>(`/wl/weekly-declaration/${id}`, data);
  },

  /**
   * 删除周宣告
   * @param id 周宣告ID
   * @returns 返回删除是否成功
   */
  deleteWeeklyDeclaration: (id: number) => {
    return request.delete<WeeklyDeclarationDTO>(`/wl/weekly-declaration/${id}`);
  }
}; 