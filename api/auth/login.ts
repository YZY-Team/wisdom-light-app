import {request} from '~/utils/request';

export interface LoginParams {
  phone: string;
  code: string;
}

export const loginApi = {
  login: (data: LoginParams) => {
    return request.post<string>('/login/phone', data);
  },
  isLogin: () => {
    return request.get('/login/check');
  },
};