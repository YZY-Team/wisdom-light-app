import { View } from 'react-native';

export default function IndexRoute() {
  // 返回一个简单的空视图，实际路由逻辑已经移到_layout.tsx中的RouteGuard组件
  return <View className="flex-1 bg-white" />;
}