import { View } from 'react-native';
import { Text } from '../../../components/nativewindui/Text';
import { Container } from '../../../components/Container';
import { Button } from '../../../components/Button';

export default function BecomeMentorScreen() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-lg font-medium mb-4">成为导师</Text>
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <View className="items-center py-4">
            <Text className="text-base mb-2">加入我们的导师团队</Text>
            <Text className="text-gray-500 text-center">分享您的专业知识，帮助更多学习者成长</Text>
          </View>
          <View className="space-y-4">
            <View>
              <Text className="mb-2">申请要求</Text>
              <View className="space-y-2">
                <Text className="text-gray-500">• 相关领域3年以上工作经验</Text>
                <Text className="text-gray-500">• 具备良好的沟通能力和教学热情</Text>
                <Text className="text-gray-500">• 每周能保证8小时以上在线时间</Text>
              </View>
            </View>
            <View>
              <Text className="mb-2">导师权益</Text>
              <View className="space-y-2">
                <Text className="text-gray-500">• 课时收入分成</Text>
                <Text className="text-gray-500">• 专属身份标识</Text>
                <Text className="text-gray-500">• 平台技术支持</Text>
              </View>
            </View>
          </View>
          <Button
            onPress={() => {
              // TODO: Implement application form
            }}
            className="mt-4"
          >
            立即申请
          </Button>
        </View>
      </View>
    </Container>
  );
}