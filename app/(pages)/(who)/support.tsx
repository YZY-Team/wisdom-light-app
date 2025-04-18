import { View,Text, Button } from 'react-native';

import { Container } from '../../../components/Container';

export default function SupportScreen() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-lg font-medium mb-4">联系客服</Text>
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <View className="items-center py-4">
            <Text className="text-base mb-2">工作时间</Text>
            <Text className="text-gray-500">周一至周五 9:00-18:00</Text>
          </View>
          <Button
            onPress={() => {
              // TODO: Implement chat with support
            }}
            title="联系客服"
          >
            
          </Button>
          <View className="flex-row justify-between items-center pt-4">
            <Text>服务热线</Text>
            <Text className="text-blue-500">400-888-8888</Text>
          </View>
        </View>
      </View>
    </Container>
  );
}