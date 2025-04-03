import { View } from 'react-native';
import { Text } from '../../../components/nativewindui/Text';
import { Container } from '../../../components/Container';
import { Button } from '../../../components/Button';

export default function MembershipScreen() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-lg font-medium mb-4">会员充值</Text>
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <View className="items-center py-4">
            <Text className="text-2xl font-bold text-yellow-500">VIP会员</Text>
            <Text className="text-gray-500 mt-2">解锁全部高级功能</Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <View>
                <Text className="font-medium">月度会员</Text>
                <Text className="text-gray-500 text-sm">¥29.9/月</Text>
              </View>
              <Button
                onPress={() => {
                  // TODO: Implement payment
                }}
                className="px-4"
              >
                购买
              </Button>
            </View>
            <View className="flex-row justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <View>
                <Text className="font-medium">年度会员</Text>
                <Text className="text-gray-500 text-sm">¥299/年</Text>
                <Text className="text-red-500 text-xs">限时优惠</Text>
              </View>
              <Button
                onPress={() => {
                  // TODO: Implement payment
                }}
                className="px-4"
              >
                购买
              </Button>
            </View>
          </View>
          <Text className="text-xs text-gray-500 text-center mt-4">
            注：购买即表示同意《会员服务协议》
          </Text>
        </View>
      </View>
    </Container>
  );
}