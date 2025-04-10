import { request } from '~/utils/request';

export const userApi = {
  me: () => {
    return request.get('/user/me');
  },
  
  updateProfile: (data: {
    username?: string;
    nickname?: string;
  }) => {
    return request.post('/user/edit', data);
  },
};
