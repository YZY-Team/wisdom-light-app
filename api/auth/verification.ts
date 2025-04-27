import {request} from '~/utils/request';

export const verificationApi = {
  getCode: (phone: string) => {
    return request.post('/sms', { phone });
  },
};