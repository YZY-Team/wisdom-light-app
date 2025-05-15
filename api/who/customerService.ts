import { request } from '~/utils/request';

export const customerServiceList = async (params: any) => {
  const response = await request.get(`/customer-service/list`, {
    params,
  });
  return response.data || [];
};

export const addCustomerService = async (serviceUserId: string, remark: string) => {
  const response = await request.post(`/friends/customer-service/${serviceUserId}`, 
    `remark=${encodeURIComponent(remark)}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
  );
  return response.data;
};
