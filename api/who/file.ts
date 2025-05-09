import AsyncStorage from "@react-native-async-storage/async-storage";

// import { fetch as fetchExpo } from 'expo/fetch';
export const fileApi = {
  uploadImage: async (params: {
    relatedId: string;
    file: any; // 保持 any 类型，兼容 RN 文件对象
  }) => {
    const formData = new FormData();

    // 直接使用 RN 的文件对象
    formData.append('file', params.file);
    formData.append('source', 'IMAGE_URL');
    formData.append('relatedId', params.relatedId);
    formData.append('bucketName', 'image');

    // 调试 FormData 内容（注意：FormData 无法直接转为对象，需手动调试）
    console.log('Uploading file with formData:', formData);
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch('http://119.29.188.102:8080/api/oss/minio/upload', {
        method: 'POST',
        body: formData,
        
        headers: {
          "Authorization": "Bearer " + token,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data; // 假设返回 { url: string }
    } catch (error) {

      console.error('Upload error:', error);
      throw error;
    }
  },
};
