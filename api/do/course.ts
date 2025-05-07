import { Course, CourseVideo } from '~/types/do/courseType';
import { request } from '~/utils/request';

// /wl/course/page get 请求帮我获取视频列表
interface CourseListParams {
  current: number;
  size: number;
  title?: string;
  type: string;
}

const getCourseList = (params: CourseListParams) => {
  return request.post<{
    records: Course[];
  }>('/wl/course/page', params);
};

/**
 * 获取课程的子课程列表
 * @param courseId 课程ID
 * @returns 子课程列表
 */
const getCourseVideos = (courseId: string) => {
  return request.get<CourseVideo[]>(`/wl/video/course/${courseId}`);
};

// post /wl/course-online/apply
export const applyCourseOnline = (params: { courseId: string; userId: string }) => {
  return request.post('/wl/course-online/apply', params);
};

export const courseApi = {
  // 获取课程列表
  getCourseList,
  // 获取课程的子课程列表
  getCourseVideos,
};
