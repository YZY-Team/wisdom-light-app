import { request } from '~/utils/request';
import {
  WeeklyDeclarationDTO,
  DailyDeclarationDTO,
  BaseResponseWeeklyDeclarationDTO,
  BaseResponseDailyDeclarationDTO,
  BaseResponseBoolean,
  BaseResponseLong
} from '~/types/be/declarationType';

export const declarationApi = {
  /**
   * 创建周宣告
   * @param data 周宣告数据，包含宣告内容、日期等信息
   * @returns 返回创建成功的周宣告ID
   */
  createWeeklyDeclaration: (data: WeeklyDeclarationDTO) => {
    return request.post<BaseResponseLong>('/wl/weekly-declaration', data);
  },

  /**
   * 获取周宣告详情
   * @param id 周宣告ID
   * @returns 返回周宣告的详细信息
   */
  getWeeklyDeclarationDetail: (id: number) => {
    return request.get<BaseResponseWeeklyDeclarationDTO>(`/wl/weekly-declaration/${id}`);
  },

  /**
   * 更新周宣告
   * @param id 周宣告ID
   * @param data 更新的周宣告数据
   * @returns 返回更新是否成功
   */
  updateWeeklyDeclaration: (id: number, data: WeeklyDeclarationDTO) => {
    return request.put<BaseResponseBoolean>(`/wl/weekly-declaration/${id}`, data);
  },

  /**
   * 删除周宣告
   * @param id 周宣告ID
   * @returns 返回删除是否成功
   */
  deleteWeeklyDeclaration: (id: number) => {
    return request.delete<BaseResponseBoolean>(`/wl/weekly-declaration/${id}`);
  },

  /**
   * 创建日宣告
   * @param data 日宣告数据，包含宣告内容、日期等信息
   * @returns 返回创建成功的日宣告ID
   */
  createDailyDeclaration: (data: DailyDeclarationDTO) => {
    return request.post<BaseResponseLong>('/wl/daily-declaration', data);
  },

  /**
   * 获取日宣告详情
   * @param id 日宣告ID
   * @returns 返回日宣告的详细信息
   */
  getDailyDeclarationDetail: (id: number) => {
    return request.get<BaseResponseDailyDeclarationDTO>(`/wl/daily-declaration/${id}`);
  },

  /**
   * 更新日宣告
   * @param id 日宣告ID
   * @param data 更新的日宣告数据
   * @returns 返回更新是否成功
   */
  updateDailyDeclaration: (id: number, data: DailyDeclarationDTO) => {
    return request.put<BaseResponseBoolean>(`/wl/daily-declaration/${id}`, data);
  },

  /**
   * 删除日宣告
   * @param id 日宣告ID
   * @returns 返回删除是否成功
   */
  deleteDailyDeclaration: (id: number) => {
    return request.delete<BaseResponseBoolean>(`/wl/daily-declaration/${id}`);
  }
};