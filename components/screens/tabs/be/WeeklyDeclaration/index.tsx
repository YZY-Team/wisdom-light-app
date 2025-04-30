import { View, Text, ScrollView, Pressable } from 'react-native';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationList from './WeeklyDeclarationList';
import {
  useCurrentWeeklyDeclaration,
  useCreateWeeklyDeclaration,
} from '~/queries/weeklyDeclaration';
import { Image } from 'react-native';
import saveIcon from '~/assets/saveIcon.png';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import { useUserStore } from '~/store/userStore';
import NoMemberTip from '../NoMemberTip';
cssInterop(Image, { className: 'style' });
cssInterop(BlurView, { className: 'style' });
const BOOK_ID = '1911671090439000066'; // TODO: 从路由或者props中获取

export default function WeeklyDeclaration() {
  const { data: currentDeclaration, isLoading, error } = useCurrentWeeklyDeclaration(BOOK_ID);
  const createMutation = useCreateWeeklyDeclaration();
  const { userInfo } = useUserStore();

  if (!userInfo?.isMember) {
    return (
      <NoMemberTip
        tipText="充值会员之后才能拥有周宣告哦～"
      />
    );
  }

  // 添加保存处理函数
  const handleSave = () => {};

  // 如果没有当前周宣告，创建一个新的
  if (!isLoading && !currentDeclaration && !createMutation.isPending) {
    const newDeclaration: Omit<WeeklyDeclarationDTO, 'id'> = {
      bookId: BOOK_ID,
      userId: '0', // 添加默认userId字段
      weekNumber: 1, // TODO: 计算当前是第几周
      title: '', // 可以根据需要设置默认标题
      declarationContent: '',
      weekStartDate: new Date().toISOString().split('T')[0], // 当前日期
      weekEndDate: new Date().toISOString().split('T')[0], // TODO: 计算周结束日期
      achievement: '',
      selfSummary: '',
      summary123456: '',
      nextStep: '',
      weekScore: '',
      weekExperience: '',
      whatWorked: '',
      whatDidntWork: '',
      whatLearned: '',
      whatNext: '',
      weeklyGoals: [],
      averageCompletionRate: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    createMutation.mutate(newDeclaration as WeeklyDeclarationDTO);
  }

  if (isLoading || createMutation.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (error || createMutation.error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">
          {error?.message || createMutation.error?.message || '获取或创建周宣告失败'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-4">
      <View className="absolute right-4 top-10 z-[1000]">
        <Pressable onPress={handleSave}>
          <BlurView
            className="h-12 w-12 flex-col items-center justify-center rounded-full bg-[#1483FD0D]"
            experimentalBlurMethod="dimezisBlurView"
            intensity={10}>
            <Image source={saveIcon} className="h-5 w-5" />
            <Text className="text-[12px] font-[600] text-[#1483FD]">保存</Text>
          </BlurView>
        </Pressable>
      </View>
      <WeeklyDeclarationList bookId={BOOK_ID} />
    </View>
  );
}
