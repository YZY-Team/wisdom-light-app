import { View, Text, TextInput, ScrollView, Pressable, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

cssInterop(Image, { className: 'style' });
// 导入AI工具图标
import openAiIcon from '~/assets/images/ai/icons/openAi.png';
import deepSeekIcon from '~/assets/images/ai/icons/deepSeek.png';
import midjourneyIcon from '~/assets/images/ai/icons/midjourney.png';
import grammarlyIcon from '~/assets/images/ai/icons/grammarly.png';
import canvaIcon from '~/assets/images/ai/icons/canva.png';
import hailuoIcon from '~/assets/images/ai/icons/hailuo.png';
import kelingIcon from '~/assets/images/ai/icons/keling.png';
import jichuangIcon from '~/assets/images/ai/icons/jichuang.png';
import jimengIcon from '~/assets/images/ai/icons/jimeng.png';
import soulIcon from '~/assets/images/ai/icons/soul.png';
import xunfeiIcon from '~/assets/images/ai/icons/xunfei.png';
import { cssInterop } from 'nativewind';
import { useRouter } from 'expo-router';

const Message = ({ isAI, content, time }: { isAI: boolean; content: string; time: string }) => (
  <View className={`flex-row ${isAI ? '' : 'flex-row-reverse'} mb-4`}>
    {isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-assistant' }}
        className="h-10 w-10 rounded-full bg-blue-100"
      />
    )}
    <View
      className={`mx-3 max-w-[70%] ${isAI ? 'bg-white' : 'bg-blue-500'} rounded-2xl p-4 shadow-sm`}>
      <Text className={`text-base ${isAI ? 'text-gray-800' : 'text-white'}`}>{content}</Text>
    </View>
    {!isAI && (
      <Image
        source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' }}
        className="h-10 w-10 rounded-full bg-gray-100"
      />
    )}
  </View>
);

// AI工具卡片组件
const AiToolCard = ({ title, icon }: { title: string; icon: any }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleConfirm = () => {
    setModalVisible(false);
    router.push('/ai/chat');
  };

  return (
    <View className="items-center w-[33%] mb-6">
      <Pressable onPress={() => setModalVisible(true)}>
        <View className="h-[72px] w-[72px] rounded-full bg-[#5264FF0D] items-center justify-center overflow-hidden self-center">
          <Image source={icon} className="h-12 w-12" contentFit="contain" />
        </View>
        <Text className="mt-1 text-base text-center text-[#000]">{title}</Text>
      </Pressable>

      {/* 确认弹窗 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View className="flex-1  justify-center items-center bg-black/50">
          <View className="w-[280px] bg-white rounded-[14px] overflow-hidden">
            <View className="items-center pt-8 pb-6">
              <View className="h-[72px] w-[72px] rounded-full  items-center justify-center overflow-hidden self-center">
                <Image source={icon} className="h-12 w-12" contentFit="contain" />
              </View>
              <Text className="mt-4 text-[16px]">确认跳转至{title}吗？</Text>
            </View>
            <View className="flex-row gap-[20%]  px-4 py-5">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="flex-1 py-[14px] items-center border border-[#0000001A] rounded-[6px]"
              >
                <Text className="text-black text-[16px]">取消</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                className="flex-1 py-[14px] items-center border border-[#0000001A] rounded-[6px]"
              >
                <Text className=" text-[16px]">确认</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function AiIndex() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View className="p-4">
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 ">
          <TextInput
            className="ml-2 flex-1 text-black/40"
            placeholder="搜索ai"
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View>

      {/* AI工具箱 */}
      <View className="px-4">
        <Text className="mb-4 px-6 text-[16px] font-[700]">AI工具箱</Text>
        <View className="flex-row flex-wrap">
          <AiToolCard
            title="Open AI"
            icon={openAiIcon}
          />
          <AiToolCard
            title="Deep Seek"
            icon={deepSeekIcon}
          />
          <AiToolCard
            title="Midjourney"
            icon={midjourneyIcon}
          />
          <AiToolCard
            title="Grammarly"
            icon={grammarlyIcon}
          />
          <AiToolCard
            title="Canva"
            icon={canvaIcon}
          />
          <AiToolCard
            title="Hailuo"
            icon={hailuoIcon}
          />
          <AiToolCard
            title="可灵AI"
            icon={kelingIcon}
          />
          <AiToolCard
            title="即创AI"
            icon={jichuangIcon}
          />
          <AiToolCard
            title="即梦AI"
            icon={jimengIcon}
          />
          <AiToolCard
            title="Soul Machines"
            icon={soulIcon}
          />
          <AiToolCard
            title="科大讯飞"
            icon={xunfeiIcon}
          />
        </View>
      </View>

      {/* AI导师列表 */}
      <View
        className="absolute mt-6 w-full px-4"
        style={{
          bottom: 20,
        }}>
        <View className='bg-[#1483fd]/5 rounded-[6px]'>
          <Link href="/tutor" asChild>
            <Pressable className="flex-row items-center rounded-xl p-4">
              <View className="h-12 w-12 rounded-full bg-blue-500 items-center justify-center">
                <Image source={require('~/assets/images/ai/logo.png')} className="h-12 w-12" contentFit="contain" />
              </View>
              <Text className="ml-3 text-base font-medium">AI导师</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666"
                style={{ marginLeft: 'auto' }}
              />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
