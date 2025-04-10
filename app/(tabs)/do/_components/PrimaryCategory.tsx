import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, { className: 'style' });

type PrimaryCategoryProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

export const PrimaryCategory = ({ title, isActive, onPress }: PrimaryCategoryProps) => (
  <Pressable
    className={`mr-4 items-center ${!isActive && 'border-b-2 border-transparent hover:bg-gray-50'}`}
    onPress={onPress}>
    {isActive ? (
      <LinearGradient
        colors={['#1687FD', '#20A3FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
        }}
        className="w-full items-center rounded-[6px] px-4 py-2">
        <Text className="text-base font-medium  text-white">{title}</Text>
      </LinearGradient>
    ) : (
      <View className="w-full items-center px-4 py-2">
        <Text className="text-base font-medium text-black/50">{title}</Text>
      </View>
    )}
  </Pressable>
);