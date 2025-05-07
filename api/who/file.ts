import { request } from '~/utils/request';

export const fileApi = {
  uploadImage: (params: {
    relatedId: string;
    file: any;  // 改为 any 类型，因为 RN 的文件对象结构不同
  }) => {
    const formData = new FormData();
    
    // 直接使用 RN 的文件对象
    formData.append('file', params.file);
    formData.append('source', 'IMAGE_URL');
    formData.append('relatedId', params.relatedId);
    formData.append('bucketName', 'image');
    
    console.log('formData:', Object.fromEntries(formData as any));
    
    return request.post('http://192.168.1.103:3000/api/upload', formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
  },
};