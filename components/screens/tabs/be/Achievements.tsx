import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { achievementBookApi } from '~/api/be/achievementBook';
import { Image } from 'expo-image';
import NoMemberTip from './NoMemberTip';
import { UserInfo } from '~/store/userStore';
import { AchievementBookDTO } from '~/types/be/achievementBookType';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(Image, { className: 'style' });

// Achievements 组件属性定义
type AchievementsProps = {
  achievementBook?: AchievementBookDTO;
  userInfo: UserInfo;
};

export default function Achievements({ achievementBook, userInfo }: AchievementsProps) {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [achievementStatus, setAchievementStatus] = useState({
    profile: '未完成',
    oath: '未完成',
    promise: '未完成',
    achievement: '未完成',
  });

  if (!userInfo?.isMember) {
    return <NoMemberTip tipText="充值会员之后才能拥有成就书哦～" />;
  }

  useEffect(() => {
    const getGoalStatus = async () => {
      if (achievementBook) {
        // 解析成就书内容并更新状态
        const profileStatus = checkProfileStatus(achievementBook);
        const oathStatus = checkOathStatus(achievementBook);
        const promiseStatus = checkPromiseStatus(achievementBook);
        console.log('bookId', bookId);
        const goalStatus = await achievementBookApi.getGoalsByBookId(achievementBook.id as string);

        const achievementStatus = checkAchievementStatus(goalStatus.data);

        console.log('profileStatus', profileStatus);

        setAchievementStatus({
          profile: profileStatus,
          oath: oathStatus,
          promise: promiseStatus,
          achievement: achievementStatus,
        });
      }
    };
    getGoalStatus();
  }, [achievementBook]);

  // 检查个人资料完成状态
  const checkProfileStatus = (data: any) => {
    console.log('个人资料数据:', data);

    // 检查个人资料字段是否已填写
    const profileFields = [
      'name',
      'nickname',
      'gender',
      'age',
      'maritalStatus',
      'childrenStatus',
      'phone',
      'email',
      'companyName',
      'position',
      'companySize',
      'annualIncome',
      'companyAddress',
      'emergencyContact',
      'homeAddress',
    ];

    // 如果没有数据，返回未完成
    if (!data) return '未完成';

    // 尝试从两种可能的数据结构中获取个人资料信息
    // 1. 直接从data读取
    // 2. 从data.content解析JSON内容
    let profileData = data;

    if (data.content) {
      try {
        // 尝试解析content字段，可能包含个人资料JSON
        const parsedContent = JSON.parse(data.content);
        if (typeof parsedContent === 'object') {
          profileData = parsedContent;
        }
      } catch (e) {
        // 如果不是JSON格式，保持原样
        console.log('内容不是JSON格式，使用原始数据');
      }
    }

    // 检查关键字段是否填写（至少需要填写50%的字段）
    const filledFields = profileFields.filter(
      (field) =>
        profileData[field] !== undefined && profileData[field] !== null && profileData[field] !== ''
    );
    console.log('个人资料字段:', profileFields);
    const completion = filledFields.length / profileFields.length;

    console.log('个人资料完成度:', completion, filledFields);

    if (completion >= 0.8) return '已完成';
    if (completion >= 0.5) return '进行中';
    return '未完成';
  };

  // 检查约誓完成状态
  const checkOathStatus = (data: any) => {
    if (!data) return '未完成';

    // 尝试从不同数据结构中获取约誓信息
    let oathData = data;
    let hasOath = false;
    let hasCoach = false;

    // 1. 直接从data检查oath和coachIds字段
    if (data.oath || data.coachIds) {
      hasOath = data.oath && data.oath.trim() !== '';
      hasCoach = data.coachIds && Array.isArray(data.coachIds) && data.coachIds.length > 0;
    }

    // 2. 从content中尝试解析
    if (data.content) {
      try {
        const parsedContent = JSON.parse(data.content);
        if (typeof parsedContent === 'object') {
          hasOath = hasOath || (parsedContent.oath && parsedContent.oath.trim() !== '');
          hasCoach =
            hasCoach ||
            (parsedContent.coachIds &&
              Array.isArray(parsedContent.coachIds) &&
              parsedContent.coachIds.length > 0);
        }
      } catch (e) {
        // 如果content不是JSON，可能是纯文本形式的誓约
        hasOath = hasOath || data.content.trim() !== '';
      }
    }

    // 3. 检查标题是否包含约誓相关内容
    if (data.title && data.title.includes('约誓')) {
      hasOath = hasOath || (data.content && data.content.trim() !== '');
    }

    console.log('约誓状态:', hasOath, hasCoach);

    if (hasOath && hasCoach) return '已完成';
    if (hasOath || hasCoach) return '进行中';
    return '未完成';
  };

  // 检查承诺完成状态
  const checkPromiseStatus = (data: any) => {
    if (!data) return '未完成';

    // 尝试从不同数据结构中获取承诺信息
    let hasPromise = false;

    // 1. 直接从data检查promise字段
    if (data.promise) {
      hasPromise = data.promise.trim() !== '';
    }

    console.log('承诺状态:', hasPromise);

    if (hasPromise) return '已完成';
    return '未完成';
  };

  // 检查成果完成状态
  const checkAchievementStatus = (data: any) => {
    if (!data) return '未完成';

    // 如果是数组，至少需要三个承诺目标才算已完成
    if (Array.isArray(data)) {
      if (data.length >= 3) return '已完成';
      if (data.length > 0) return '进行中';
      return '未完成';
    }

    console.log('成果状态:', data);

    // 尝试从不同数据结构中获取成果信息
    let hasAchievement = false;

    // 1. 直接从data检查achievement字段
    if (data.achievement) {
      hasAchievement = data.achievement.trim() !== '';
    }

    // 2. 从content中尝试解析
    if (data.content) {
      try {
        const parsedContent = JSON.parse(data.content);
        if (typeof parsedContent === 'object' && parsedContent.achievement) {
          hasAchievement = hasAchievement || parsedContent.achievement.trim() !== '';
        }
      } catch (e) {
        // 如果标题包含成果，则可能是纯文本形式的成果
        if (data.title && data.title.includes('成果')) {
          hasAchievement = hasAchievement || data.content.trim() !== '';
        }
      }
    }

    console.log('成果状态:', hasAchievement);

    if (hasAchievement) return '已完成';
    return '未完成';
  };

  // 获取创建日期
  const getCreateDate = () => {
    if (achievementBook?.createTime) {
      try {
        const date = new Date(achievementBook.createTime);
        if (!isNaN(date.getTime())) {
          return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        }
      } catch (e) {
        console.log('日期解析错误:', e);
      }
    }
    return '2023/04/15'; // 默认日期
  };

  // 计算目标达成率
  const calculateCompletionRate = () => {
    const statusMap: Record<string, number> = {
      已完成: 1,
      进行中: 0.5,
      未完成: 0,
    };

    const profileScore = statusMap[achievementStatus.profile] || 0;
    const oathScore = statusMap[achievementStatus.oath] || 0;
    const promiseScore = statusMap[achievementStatus.promise] || 0;
    const achievementScore = statusMap[achievementStatus.achievement] || 0;

    const totalScore = profileScore + oathScore + promiseScore + achievementScore;
    const maxScore = 4; // 四个部分的最高分

    const completionRate = Math.round((totalScore / maxScore) * 100);
    return completionRate;
  };

  // 获取已完成项目总数
  const getCompletedCount = () => {
    return Object.values(achievementStatus).filter((status) => status === '已完成').length;
  };

  return (
    <View className="flex-1 pt-4 px-4">
      {/* 总数据 */}
      <View className="mb-4">
        <Text className="mb-2 text-base font-[800] ">总数据</Text>
        <View className="flex-row flex-wrap justify-between">
          {[
            { value: getCompletedCount().toString(), label: '完成宣告' },
            { value: '12', label: '课程学习' },
            { value: '8', label: '成就解锁' },
            {
              value: `${calculateCompletionRate()}%`,
              label: '目标达成率',
              showProgress: true,
              progress: calculateCompletionRate(),
            },
          ].map((item, index) => (
            <View
              key={item.label}
              style={{
                // boxShadow: '0px 4px 4px 0px rgba(20, 131, 253, 0.10)',
                elevation: 2,
                zIndex: 1,
              }}
              className={`${
                index < 2 ? 'mb-4' : ''
              } flex h-24 w-[48%] items-center justify-center rounded-xl bg-white`}>
              <View className=" flex h-[80%] w-full items-center justify-center   ">
                <Text
                  className="text-center text-[#1483FD]"
                  style={{
                    fontFamily: 'Roboto',
                    fontSize: 24,
                    fontWeight: '700',
                    lineHeight: 28,
                  }}>
                  {item.value}
                </Text>
                <Text className=" text-center text-sm text-gray-400">{item.label}</Text>
              </View>
              {item.showProgress && (
                <View className="h-[5px] w-full px-4 ">
                  <View className="overflow-hidden rounded-full bg-gray-100">
                    <View
                      className="h-full rounded-full bg-[#FF9F21]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 成就书列表 */}
      <View>
        <View className="mb-4 flex flex-row items-center    justify-between">
          <Text className=" flex items-center justify-center text-base  font-[800] ">成就书</Text>
        </View>
        <View className="flex flex-col gap-2 ">
          {[
            {
              icon: 'person',
              color: '#FFB74D',
              title: '个人资料',
              status: achievementStatus.profile,
              date: getCreateDate(),
              href: {
                pathname: '/profile',
                params: {
                  bookId: achievementBook?.id || '',
                },
              },
            },
            {
              icon: 'star',
              color: '#4CAF50',
              title: '我的约誓',
              status: achievementStatus.oath,
              date: getCreateDate(),
              href: {
                pathname: '/oath',
                params: {
                  bookId: achievementBook?.id || '',
                },
              },
            },
            {
              icon: 'book',
              color: '#2196F3',
              title: '我的承诺',
              status: achievementStatus.promise,
              date: getCreateDate(),
              href: {
                pathname: '/promise',
                params: {
                  bookId: achievementBook?.id || '',
                },
              },
            },
            {
              icon: 'rocket',
              color: '#F44336',
              title: '创造成果',
              status: achievementStatus.achievement,
              date: getCreateDate(),
              href: {
                pathname: '/achievement',
                params: {
                  bookId: achievementBook?.id || '',
                },
              },
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              asChild>
              <TouchableOpacity activeOpacity={0.8} className="h-[72px] flex-row items-center gap-4 rounded-xl bg-white p-4">
                <View className="flex-1 flex-row items-center gap-4">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}20` }}>
                    <Ionicons
                      name={item.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <View className="flex flex-1 flex-col gap-1">
                    <Text className="text-base font-medium">{item.title}</Text>
                    <Text className="text-sm text-gray-400">{item.status}</Text>
                    <Text className="text-xs text-gray-300">创建于 {item.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>
    </View>
  );
}
