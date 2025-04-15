import { request } from '~/utils/request';
import {
  DailyDeclarationDTO,
  BaseResponseDailyDeclarationDTO,
  BaseResponseBoolean,
  BaseResponseLong,
  NewDailyDeclarationDTO,
  BaseResponseNewDailyDeclarationDTO
} from '~/types/be/declarationType';

export const dailyDeclarationApi = {
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
  },

  /**
   * 创建新格式的日宣告
   * @param data 日宣告数据，包含详细的计划内容和日目标
   * @returns 返回创建成功的日宣告ID
   */
  createNewDailyDeclaration: (data: NewDailyDeclarationDTO) => {
    return request.post<BaseResponseLong>('/wl/daily-declaration', data);
  },

  /**
   * 获取今日日宣告详情
   * @returns 返回今日日宣告的详细信息
   */
  getTodayDailyDeclaration: (bookId:string) => {
    return request.get<NewDailyDeclarationDTO>('/wl/daily-declaration/today', {
      params: { bookId }
    });
  },

  /**
   * 获取新格式的日宣告详情
   * @param id 日宣告ID
   * @returns 返回详细的日宣告信息
   */
  getNewDailyDeclarationDetail: (id: string) => {
    return request.get<NewDailyDeclarationDTO>(`/wl/daily-declaration/${id}`);
  },

  /**
   * 更新新格式的日宣告
   * @param id 日宣告ID
   * @param data 更新的日宣告数据
   * @returns 返回更新是否成功
   */
  updateNewDailyDeclaration: (id: string, data: NewDailyDeclarationDTO) => {
    return request.put<BaseResponseBoolean>(`/wl/daily-declaration/${id}`, data);
  },

  /**
   * 删除新格式的日宣告
   * @param id 日宣告ID
   * @returns 返回删除是否成功
   */
  deleteNewDailyDeclaration: (id: number) => {
    return request.delete<BaseResponseBoolean>(`/wl/daily-declaration/${id}`);
  },

  /**
   * 获取成就书的所有日宣告
   * @param bookId 成就书ID
   * @returns 返回该成就书下的所有日宣告列表
   */
  getBookDailyDeclarations: (bookId: string) => {
    return request.get<NewDailyDeclarationDTO[]>(`/wl/daily-declaration/list/book`, {
      params:{
        bookId
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
}; 