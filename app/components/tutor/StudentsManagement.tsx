import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';

// 字母索引数据
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 模拟的学员数据
const STUDENTS = {
  'A': [
    { id: 'a1', name: 'A1212Peter' },
    { id: 'a2', name: 'A1212Peter' }
  ],
  'B': [
    { id: 'b1', name: 'B1212Peter' },
    { id: 'b2', name: 'B1212Peter' }
  ],
  'C': [
    { id: 'c1', name: 'C1212Peter' },
    { id: 'c2', name: 'C1212Peter' },
    { id: 'c3', name: 'C1212Peter' },
    { id: 'c4', name: 'C1212Peter' },
    { id: 'c5', name: 'C1212Peter' },
    { id: 'c6', name: 'C1212Peter' },
    { id: 'c7', name: 'C1212Peter' }
  ]
};

export default function StudentsManagement() {
  return (
    <View className="flex-1 bg-white">
      {/* 字母索引列表 */}
      <View className="px-4 py-2">
        <Text className="text-center text-[12px] text-gray-500">{ALPHABET.join('')}</Text>
      </View>

      {/* 学员列表 */}
      <ScrollView className="flex-1 px-4">
        {Object.entries(STUDENTS).map(([letter, students]) => (
          <View key={letter} className="mb-4">
            {/* 字母索引标题 */}
            <View className="mb-2">
              <View className="w-6 h-6 bg-white rounded-sm justify-center items-center">
                <Text className="text-[14px] text-black">{letter}</Text>
              </View>
            </View>

            {/* 学员列表 */}
            <View className="flex-row flex-wrap gap-3">
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  className="w-[108px] h-[40px] bg-[rgba(20,131,253,0.05)] rounded-[12px] flex-row items-center px-2"
                >
                  <View className="w-5 h-5 rounded-full bg-black mr-1" />
                  <Text className="text-[14px] text-black">{student.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 