import { request } from '~/utils/request';

// get /wl/course-online/upcoming 获取即将开始的线上课程
const getOnlineCoutseList = () => {
  return request.get('/wl/course-online/upcoming');
};

// get /wl/course-online/booked 获取已预约的线上课程
const getBookedOnlineCoutseList = () => {
  return request.get('/wl/course-online/reserved');
};

// post /wl/course-online/{courseId}/reserve 预约线上课程
const reserveOnlineCoutse = (courseId: string) => {
  return request.post(`/wl/course-online/${courseId}/reserve`);
};

// /wl/course-online/{courseId}/dialog/users/{userId} 加入课程群聊
const joinCourseDialog = (courseId: string, userId: string) => {
  return request.post(`/wl/course-online/${courseId}/dialog/users/${userId}`);
};

export const onlineCoutseApi = {
  joinCourseDialog,
  getOnlineCoutseList,
  getBookedOnlineCoutseList,
  reserveOnlineCoutse,
};
