import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useState, useRef } from 'react';
import * as Clipboard from 'expo-clipboard';

import { Container } from '../../../components/Container';
import copyIcon from '~/assets/images/who/copyIcon.png';
import copyCIcon from '~/assets/images/who/copyC.png';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

cssInterop(Image, { className: 'style' });
export default function SupportScreen() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const handleCopyId = async (id: string) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    await Clipboard.setStringAsync(id);
    setCopiedId(id);
    // 2秒后重置状态
    timeoutRef.current = setTimeout(() => {
      setCopiedId(null);
      timeoutRef.current = null;
    }, 2000);
  };

  const supportStaff = [
    { name: '客服小水', id: '124' },
    { name: '客服依依', id: '125' },
    { name: '客服Amiy', id: '126' },
  ];

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

      <View className="flex flex-col space-y-4">
        {supportStaff.map((staff, index) => (
          <View key={index} className="flex-row items-center  rounded-lg p-4 ">
            <View className=" rounded-full  mr-3">
              <Image source={require('~/assets/images/who/customer-service2.png')} className="w-10 h-10" contentFit="contain" />
            </View>

            <View className="flex-1">
              <Text className="text-[#1483FD] text-base">{staff.name}</Text>
              <Text className="text-gray-500 text-xs">ID:{staff.id}</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleCopyId(staff.id)}
              className="p-2"
            >
              <Image
                source={copiedId === staff.id ? copyCIcon : copyIcon}
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}