import { request } from '~/utils/request';



export interface TutorApplicationParams {
  userId: number;
  realName: string;
  specialization: string;
  qualificationUrls: string;
  introduction: string;
  teachingYears: number;
  contactPhone: string;
  contactEmail: string;
  applyReason: string;
}

export const tutorApi = {
  getTutorList: async () => {
    const response = await request.get('/wl/tutor/list');
    return response.data;
  },
  submitApplication: (data: TutorApplicationParams) => {
    return request.post('/wl/tutor/application/submit', data);
  },
};
