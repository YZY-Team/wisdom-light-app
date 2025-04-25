import { useQuery } from '@tanstack/react-query';
import { courseApi } from '~/api/do/course';

interface CourseListParams {
  current: number;
  size: number;
  title?: string;
  type:string;
}

/**
 * 获取课程列表的查询钩子
 * @param params 查询参数对象
 * @returns 包含课程列表数据、加载状态和错误信息的对象
 */
export const useCourseList = (params: CourseListParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courseList', params],
    queryFn: () => courseApi.getCourseList(params),
  });
  return { data, isLoading, error };
};


/**
 * 获取课程子课程列表的查询钩子
 * @param courseId 课程ID
 * @returns 包含子课程列表数据、加载状态和错误信息的对象
 */
export const useCourseVideos = (courseId: string) => {
    const { data, isLoading, error } = useQuery({
      queryKey: ['courseVideos', courseId],
      queryFn: () => courseApi.getCourseVideos(courseId),
    });
    return { data, isLoading, error };
  };