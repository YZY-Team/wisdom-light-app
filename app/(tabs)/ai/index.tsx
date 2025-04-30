import { View, Text, TextInput, ScrollView, Pressable, Modal, Linking } from 'react-native';
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



// AI工具卡片组件
const AiToolCard = ({ title, icon, websiteUrl }: { title: string; icon: any; websiteUrl: string }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setModalVisible(false);
    try {
      // 检查URL是否可以打开
      const canOpen = await Linking.canOpenURL(websiteUrl);
      if (canOpen) {
        await Linking.openURL(websiteUrl);
      } else {
        console.log(`无法打开URL: ${websiteUrl}`);
      }
    } catch (error) {
      console.error(`打开链接出错: ${error}`);
    }
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
  return (
    <View className="flex-1 bg-white py-4">
      {/* <View className="p-4">
        <View className="flex-row items-center rounded-full bg-[#1687fd]/5 px-4 ">
          <TextInput
            className="ml-2 flex-1 text-black/40"
            placeholder="搜索ai"
            placeholderTextColor="#666"
          />
          <Ionicons name="search-outline" size={20} color="#666" />
        </View>
      </View> */}

      {/* AI工具箱 */}
      <View className="px-4">
        <Text className="mb-4 px-6 text-[16px] font-[6h00]">AI工具箱</Text>
        <View className="flex-row flex-wrap">
          <AiToolCard
            title="Open AI"
            icon={openAiIcon}
            websiteUrl="https://openai.com"
          />
          <AiToolCard
            title="Deep Seek"
            icon={deepSeekIcon}
            websiteUrl="https://deepseek.com"
          />
          <AiToolCard
            title="Midjourney"
            icon={midjourneyIcon}
            websiteUrl="https://midjourney.com"
          />
          <AiToolCard
            title="Grammarly"
            icon={grammarlyIcon}
            websiteUrl="https://www.grammarly.com"
          />
          <AiToolCard
            title="Canva"
            icon={canvaIcon}
            websiteUrl="https://www.canva.com"
          />
          <AiToolCard
            title="Hailuo"
            icon={hailuoIcon}
            websiteUrl="https://www.hailuo.ai"
          />
          <AiToolCard
            title="可灵AI"
            icon={kelingIcon}
            websiteUrl="https://app.klingai.com/cn/"
          />
          <AiToolCard
            title="即创AI"
            icon={jichuangIcon}
            websiteUrl="https://jichuang.ai"
          />
          <AiToolCard
            title="即梦AI"
            icon={jimengIcon}
            websiteUrl="https://jimeng.jianying.com"
          />
          <AiToolCard
            title="Soul Machines"
            icon={soulIcon}
            websiteUrl="https://www.soulmachines.com"
          />
          <AiToolCard
            title="科大讯飞"
            icon={xunfeiIcon}
            websiteUrl="https://www.xfyun.cn"
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
