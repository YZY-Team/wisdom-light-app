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

// 实际返回的导师数据类型
export interface MyTutorData {
  createTime: string;
  joinTime: string;
  relationId: string;
  status: string;
  studentAvatarUrl: string | null;
  studentId: string;
  studentNickname: string | null;
  tutorAvatarUrl: string | null;
  tutorId: string;
  tutorNickname: string;
  tutorType: string | null;
  updateTime: string;
}
// 成就书接口定义
interface AchievementBook {
  id: string;
  userId: string;
  name: string;
  nickname: string;
  gender: string;
  age: number | null;
  maritalStatus: string;
  childrenStatus: string;
  phone: string;
  email: string;
  companyName: string;
  position: string;
  companySize: string;
  annualIncome: string;
  companyAddress: string;
  emergencyContact: string;
  homeAddress: string;
  oath: string;
  promise: string | null;
  isActive: boolean;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
  coachIds: string | null;
  createTime: string;
  updateTime: string;
}

// 日宣告接口定义
interface DailyDeclaration {
  id: string;
  userId: string;
  bookId: string;
  weeklyDeclarationId: string;
  dayNumber: number;
  declarationDate: string;
  morningPlan: string;
  noonPlan: string;
  afternoonPlan: string;
  eveningPlan: string;
  dayScore: string;
  dayExperience: string;
  whatWorked: string;
  whatDidntWork: string;
  whatLearned: string;
  whatNext: string;
  createTime: string;
  updateTime: string;
}

// 周宣告接口定义
interface WeeklyDeclaration {
  id: string;
  userId: string;
  bookId: string;
  weekNumber: number;
  title: string;
  declarationContent: string;
  weekStartDate: string;
  weekEndDate: string;
  achievement: string;
  selfSummary: string;
  summary123456: string;
  nextStep: string;
  weekScore: string;
  weekExperience: string;
  whatWorked: string;
  whatDidntWork: string;
  whatLearned: string;
  whatNext: string;
  createTime: string;
  updateTime: string;
}

// 学员宣告完整数据接口
export interface StudentDeclaration {
  studentId: string;
  studentNickname: string;
  studentAvatarUrl: string;
  achievementBook: AchievementBook;
  recentDailyDeclarations: DailyDeclaration[];
  recentWeeklyDeclarations: WeeklyDeclaration[];
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
  // 添加学员
  addTutorStudent: async (studentId: string) => {
    const response = await request.post(`/wl/tutor/student/add/${studentId}`);
    return response;
  },
  // 获取我的导师列表 /wl/tutor/student/my-tutors
  getMyTutors: async () => {
    const response = await request.get<MyTutorData[]>('/wl/tutor/student/my-tutors');
    return response.data;
  },
  // post /wl/achievement-book/{id}/coaches 绑定教练
  bindCoach: async (id: string, coachIds: string[]) => {
    const response = await request.post(`/wl/achievement-book/${id}/coaches`, coachIds);
    return response;
  },
  // get /wl/tutor/student/student/declarations/{studentId} 获取学员的日宣告，周宣告，成就书
  getStudentDeclarations: async (studentId: string) => {
    const response = await request.get<StudentDeclaration>(
      `/wl/tutor/student/student/declarations/${studentId}`
    );
    return response;
  },
  // get /wl/tutor/student/available-tutors 分类查询导师
  getAvailableTutors: async (params: {
    current: string;
    size: string;
    tutorType: string;
  }) => {
    const response = await request.get('/wl/tutor/student/available-tutors', { params });
    return response;
  },
  // /wl/tutor/student/bind-tutor/{tutorId} 绑定导师
  bindTutor: async (tutorId: string) => {
    const response = await request.post(`/wl/tutor/student/bind-tutor/${tutorId}`);
    return response;
  },
};
