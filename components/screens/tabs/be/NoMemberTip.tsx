import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import noMember from '~/assets/images/be/no-member.png';
import { Link, useRouter } from 'expo-router';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(Image, { className: 'style' });

type NoMemberTipProps = {
  tipText?: string;
  buttonText?: string;
  onPress?: () => void;
};

export default function NoMemberTip({
  tipText = '充值会员之后才能拥有成就书哦～',
  buttonText = '加入会员',
  onPress,
}: NoMemberTipProps) {
  const router = useRouter();
  return (
    <View className="relative w-full flex-1">
      <View className="flex-1 items-center justify-center">
        <View className="mb-6">
          <Image source={noMember} className="h-[100px] w-[100px]" />
        </View>
        <Text className="mb-2 text-center text-lg font-medium text-[#00000080]">{tipText}</Text>
      </View>
      <View className="absolute bottom-[34px] left-4 right-4">
        <Link href="/membership" asChild>
          <Pressable>
            <LinearGradient
              colors={['#FFE062', '#FF9327']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex h-[44px] w-full items-center justify-center"
              style={{
                borderRadius: 6,
                boxShadow: '0px 10px 6px 0px rgba(253, 171, 20, 0.4)',
              }}>
              <Text className="text-[20px] font-semibold text-white">{buttonText}</Text>
            </LinearGradient>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
