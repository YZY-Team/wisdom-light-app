import { View, Text, ScrollView, Pressable } from 'react-native';
import { WeeklyDeclarationDTO } from '~/types/be/declarationType';
import WeeklyDeclarationList from './WeeklyDeclarationList';
import { useCurrentWeeklyDeclaration } from '~/queries/weeklyDeclaration';
import { Image } from 'react-native';
import saveIcon from '~/assets/saveIcon.png';
import { cssInterop } from 'nativewind';
import { BlurView } from 'expo-blur';
import NoMemberTip from '../NoMemberTip';
import { useState } from 'react';
import { UserInfo } from '~/store/userStore';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

cssInterop(Image, { className: 'style' });
cssInterop(BlurView, { className: 'style' });

// WeeklyDeclaration 组件属性定义
type WeeklyDeclarationProps = {
  bookId: string;
  userInfo: UserInfo;
};

export default function WeeklyDeclaration({ bookId, userInfo }: WeeklyDeclarationProps) {
  if (!userInfo?.isMember) {
    return <NoMemberTip tipText="充值会员之后才能拥有周宣告哦～" />;
  }

  if (!bookId) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>未找到活跃的成就书</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={50}
      className="flex-1"
      behavior={'padding'}
      style={{ flex: 1 }}>
      {bookId ? (
        <WeeklyDeclarationList bookId={bookId} />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>未找到活跃的成就书</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
