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

export const onlineCoutseApi = {
  getOnlineCoutseList,
  getBookedOnlineCoutseList,
  reserveOnlineCoutse,
};
