import { Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, { className: 'style' });

type SecondaryCategoryProps = {
  title: string;
  isActive?: boolean;
  onPress: () => void;
};

export default function SecondaryCategory({ title, isActive, onPress }: SecondaryCategoryProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-4 flex items-center rounded-[6px]`}>
    {isActive ? (
      <LinearGradient
        colors={['#20B4F3', '#5762FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          boxShadow:"0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
        }}
        className="w-full items-center rounded-[6px] px-4 py-2">
        <Text className="text-white">{title}</Text>
      </LinearGradient>
    ) : (
      <Text className="px-[10px] py-2 text-[#1483FD] rounded-[6px] border border-[#1483FD]">{title}</Text>
    )}
  </Pressable>
);
}