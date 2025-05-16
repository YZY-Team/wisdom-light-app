import { View } from 'react-native';
import { Stack } from 'expo-router';
import TeacherUpcomingCourseList from '~/components/screens/tabs/do/TeacherUpcomingCourseList';

export default function TeacherCoursesScreen() {
  return (
    <View className="flex-1 bg-[#F5F8FC]">
      <Stack.Screen options={{ title: '待开课列表', headerShown: true }} />
      <TeacherUpcomingCourseList />
    </View>
  );
} 