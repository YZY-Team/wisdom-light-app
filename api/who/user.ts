import { UserInfo } from '~/store/userStore';
import { request } from '~/utils/request';

export const userApi = {
  me: () => {
    return request.get<UserInfo>('/user/me');
  },
  
  updateProfile: (data: {
    username?: string;
    nickname?: string;
    avatarUrl?: string;
  }) => {
    return request.post('/user/edit', data);
  },
};
