import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import * as Clipboard from 'expo-clipboard';

import { Container } from '../../../components/Container';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { customerServiceList, addCustomerService } from '~/api/who/customerService';

cssInterop(Image, { className: 'style' });
export default function SupportScreen() {
  const [customerServices, setCustomerServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const router = useRouter();
  console.log('customerServices', customerServices);
  useEffect(() => {
    fetchCustomerServices();
  }, []);

  const fetchCustomerServices = async () => {
    try {
      setLoading(true);
      const response = await customerServiceList({});
      if (response && Array.isArray(response)) {
        setCustomerServices(response);
      }
    } catch (error) {
      console.error('获取客服列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomerService = async (userId: string, remark: string) => {
    try {
      setAddingId(userId);
      const response = await addCustomerService(userId, remark);
      console.log('response', response);
      Alert.alert('成功', '已成功添加客服');
    } catch (error) {
      console.error('添加客服失败:', error);
      Alert.alert('失败', '添加客服失败，请稍后再试');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View className="flex-1 p-4 ">
      <View className="px-4  py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] ">人工客服</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text>加载中...</Text>
        </View>
      ) : (
        <View className="flex flex-col space-y-4">
          {customerServices.length > 0 ? (
            customerServices.map((staff, index) => (
              <View key={index} className="flex-row items-center rounded-lg p-4">
                <View className="mr-3 rounded-full">
                  <Image
                    source={
                      staff.avatar
                        ? { uri: staff.avatar }
                        : require('~/assets/images/who/customer-service2.png')
                    }
                    className="h-10 w-10"
                    contentFit="contain"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base text-[#1483FD]">
                    {staff.serviceCode || staff.username || '客服人员'}
                  </Text>
                  <Text className="text-xs text-gray-500">ID:{staff.userId}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleAddCustomerService(staff.userId, staff.serviceCode)}
                  className="rounded-md bg-[#1483FD] px-3 py-2"
                  disabled={addingId === staff.userId}>
                  <Text className="text-white">
                    {addingId === staff.userId ? '添加中...' : '添加'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="mt-10 flex-1 items-center justify-center">
              <Text>暂无客服人员</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
