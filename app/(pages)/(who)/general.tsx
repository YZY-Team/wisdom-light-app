import { View,Text } from 'react-native';

import { Container } from '../../../components/Container';

export default function GeneralScreen() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-lg font-medium mb-4">通用设置</Text>
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <View className="flex-row justify-between items-center">
            <Text>深色模式</Text>
            {/* TODO: Add toggle switch */}
          </View>
          <View className="flex-row justify-between items-center">
            <Text>通知设置</Text>
            {/* TODO: Add toggle switch */}
          </View>
          <View className="flex-row justify-between items-center">
            <Text>语言设置</Text>
            <Text className="text-gray-500">简体中文</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text>版本信息</Text>
            <Text className="text-gray-500">v1.0.0</Text>
          </View>
        </View>
      </View>
    </Container>
  );
}