import { useQuery } from '@tanstack/react-query';
import { onlineCoutseApi } from '~/api/do/onlineCoutse';

/**
 * 获取即将开始的线上课程列表的查询钩子
 * @returns 包含即将开始的线上课程列表数据、加载状态和错误信息的对象
 */
export const useUpcomingOnlineCourses = () => {
  return useQuery({
    queryKey: ['upcomingOnlineCourses'],
    queryFn: () => onlineCoutseApi.getOnlineCoutseList(),
  });
};

/**
 * 获取已预约的线上课程列表的查询钩子
 * @returns 包含已预约的线上课程列表数据、加载状态和错误信息的对象
 */
export const useBookedOnlineCourses = () => {
  return useQuery({
    queryKey: ['bookedOnlineCourses'],
    queryFn: () => onlineCoutseApi.getBookedOnlineCoutseList(),
  });
}; 