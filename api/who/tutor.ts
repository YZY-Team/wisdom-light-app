import { TutorData } from '~/app/api/who/tutor';
import { request } from '~/utils/request';

export interface TutorApplicationParams {
  userId: string;
  name: string;
  age: number;
  gender: string;
  wechat: string;
  phone: string;
  email: string;
  companyName: string;
  platform: string;
  serialNumber: string;
  profession: string;
  homeAddress: string;
  oath: string;
  vision: string;
  teamSize: number;
  assistantCount: number;
  coachCount: number;
  tutorType: string;
}

export const tutorApi = {
  getTutorList: async () => {
    const response = await request.get('/wl/tutor/list');
    return response.data;
  },
  submitApplication: (data: TutorApplicationParams) => {
    return request.post('/wl/tutor/application/submit', data);
  },
  getCurrentTutor: async () => {
    const response = await request.get<TutorData>('/wl/tutor/application/my');
    return response;
  },
  cancelApplication: (applicationId: string) => {
    return request.post(`/wl/tutor/application/cancel/${applicationId}`);
  },
  // 获取导师的学员列表
  getTutorStudents: async () => {
    const response = await request.get('/wl/tutor/student/list');
    return response.data;
  },
};
