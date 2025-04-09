import { request } from '~/utils/request';

export const userApi = {
  me: () => {
    return request.get('/user/me');
  },
};
