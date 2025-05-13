import { View, Text, ScrollView, TouchableOpacity, Pressable, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tutorApi } from '~/api/who/tutor';
import { useEffect, useState } from 'react';
import { friendApi } from '~/api/have/friend';
import { achievementBookApi } from '~/api/be/achievementBook';
import { Image } from 'expo-image';
import type { TutorData } from '~/app/api/who/tutor';

interface Tutor {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function Oath() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tutorList, setTutorList] = useState<Tutor[]>([]);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [oath, setOath] = useState('');
  const { data: tutors } = useQuery<TutorData[]>({
    queryKey: ['getMyTutors'],
    queryFn: () => {
      return tutorApi.getMyTutors();
    },
  });

  const { data: activeBook } = useQuery({
    queryKey: ['activeAchievementBook'],
    queryFn: () => achievementBookApi.getActiveAchievementBook(),
  });

  useEffect(() => {
    const getTutor = async () => {
      if (tutors && tutors.length > 0) {
        const newTutorList = [];
        for (const tutor of tutors) {
          console.log("tutor", tutor);
          
          if (tutor.tutorId) {
            const friend = await friendApi.getFriend(tutor.tutorId);
            newTutorList.push({
              id: friend.data.userId,
              name: friend.data.nickname,
              avatarUrl: friend.data.avatarUrl,
            });
          }
        }
        console.log('newTutorList', newTutorList);
        setTutorList(newTutorList);
      }
    };
    getTutor();
  }, [tutors]);

  useEffect(() => {
    if (activeBook?.data) {
      setOath(activeBook.data.oath || '');
      // if (activeBook.data.coachIds) {
      //   const coachId = activeBook.data.coachIds;
      //   const tutor = tutorList.find(t => t.id === coachId);
      //   if (tutor) {
      //     setSelectedTutor(tutor);
      //   }
      // }
    }
  }, [activeBook, tutorList]);

  const handleSave = async () => {
    if (!activeBook?.data?.id) return;
    console.log('selectedTutor', selectedTutor);
    
    try {

      const res = await achievementBookApi.updateAchievementBook(activeBook.data.id, {
        ...activeBook.data,
        oath: oath,
      });
      console.log('res', res);
      // 刷新成就书数据
      await queryClient.invalidateQueries({ queryKey: ['activeAchievementBook'] });
      if (res.code === 200) {
        Alert.alert('保存成功');
      }
      else {
        // @ts-ignore
        Alert.alert('保存失败'+res?.error );
      }
    } catch (error) {
      console.error('更新成就书失败:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* 固定的顶部导航 */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] font-semibold">我的约誓</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* 可滚动的内容区域 */}
      <ScrollView
        className="mt-4 flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-base leading-6 text-gray-600">
          成就我的目标，是为了
          <Text className="font-[600]">支持我成就我的理想</Text>
          ，透过
          <Text className="font-[600]">清晰目的、具体目标、有效计划和承诺行动</Text>
          ，以致在"IN领袖之道"期间创造我想要的成果。在成就书中宣言我想要的目标，必须是对我是
          <Text className="font-[600]">重要的、有价值的、具有挑战性的、有伸展性的及可度量的</Text>。
        </Text>

        <View className="flex-row items-center">
          <Text className="text-base font-[600] text-[#1483FD]">教练：</Text>
          <TouchableOpacity 
            className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-[#1483FD0D]"
            onPress={() => setShowTutorModal(true)}
          >
            {selectedTutor ? (
              <Image
                source={{ uri: selectedTutor.avatarUrl }}
                className="h-8 w-8 rounded-lg"
              />
            ) : (
              <AntDesign name="plus" size={20} color="#1483FD" />
            )}
          </TouchableOpacity>
          {selectedTutor && (
            <Text className="ml-2 text-sm text-gray-600">{selectedTutor.name}</Text>
          )}
        </View>

        <View className="mt-4 h-[200px] rounded-lg bg-[#1483FD0D] p-4">
          <TextInput 
            className="text-sm text-gray-600" 
            placeholder="请输入..." 
            multiline
            value={oath}
            onChangeText={setOath}
          />
        </View>

        <View className="mt-20 w-full">
          <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full rounded-[6px]"
            style={{
              boxShadow: '0px 6px 10px 0px rgba(20, 131, 253, 0.40)',
            }}>
            <Pressable 
              className="h-[44px] items-center justify-center"
              onPress={handleSave}
            >
              <Text
                className="text-center text-[16px] text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: '700',
                }}>
                确认
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* 导师选择弹窗 */}
      <Modal
        visible={showTutorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTutorModal(false)}
      >
        <View className="flex-1 bg-black/50 p-4">
          <View className="mt-[30%] rounded-xl bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold">选择教练</Text>
              <TouchableOpacity onPress={() => setShowTutorModal(false)}>
                <AntDesign name="close" size={24} color="#00000080" />
              </TouchableOpacity>
            </View>
            <View className="mt-4">
              {tutorList.map((tutor) => (
                <TouchableOpacity
                  key={tutor.id}
                  className="mb-4 flex-row items-center"
                  onPress={() => {
                    setSelectedTutor(tutor);
                    setShowTutorModal(false);
                  }}
                >
                  <Image
                    source={{ uri: tutor.avatarUrl }}
                    className="h-12 w-12 rounded-full"
                  />
                  <Text className="ml-4 text-base">{tutor.name}</Text>
                  {selectedTutor?.id === tutor.id && (
                    <AntDesign name="check" size={20} color="#1483FD" style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
