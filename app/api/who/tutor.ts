import { request, ApiResponse } from '~/utils/request';

export interface TutorApplicationParams {
  userId: number;
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
}

export interface TutorData {
  applicationId: string;
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
  status: string;
  reviewComment: string | null;
  reviewTime: string | null;
  createTime: string;
  updateTime: string;
}

export const tutorApi = {
  getTutorList: async () => {
    const response = await request.get('/wl/tutor/list');
    return response.data;
  },
  submitApplication: (data: TutorApplicationParams) => {
    return request.post('/wl/tutor/application/submit', data);
  },
  getCurrentTutor: async (): Promise<ApiResponse<TutorData | null>> => {
    const response = await request.get<TutorData | null>('/wl/tutor/application/my');
    return response;
  },
}; 