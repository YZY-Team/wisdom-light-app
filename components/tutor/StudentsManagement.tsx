import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';
import { tutorApi } from '~/api/who/tutor';
import { pinyin } from 'pinyin-pro';
import { router } from 'expo-router';
cssInterop(Image, { className: 'style' });
// 字母索引数据
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 接口定义
interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
}

// API返回的学员数据结构
interface ApiStudent {
  relationId?: string;
  studentId?: string;
  studentNickname: string;
  studentAvatarUrl?: string;
  [key: string]: any;
}

// API响应类型
interface ApiResponse<T> {
  records?: T[];
  [key: string]: any;
}

interface StudentsByLetter {
  [key: string]: Student[];
}

interface Item {
  type: string;
  key: string;
  title?: string;
  students?: Student[];
}

interface StudentsManagementProps {
  onRefresh?: () => void;
}

const StudentsManagementWithFlashList = ({ onRefresh }: StudentsManagementProps) => {
  const flashListRef = useRef<FlashList<Item>>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const alphabetContainerRef = useRef<View>(null);
  const [alphabetLayout, setAlphabetLayout] = useState({ height: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flattenedData, setFlattenedData] = useState<Item[]>([]);

  // 处理学员点击，跳转到详情页面
  const handleStudentPress = (studentId: string) => {
    console.log('点击学员:', studentId);
    router.push(`/studentInfo/${studentId}`);
  };

  // 获取学员数据
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tutorApi.getTutorStudents();
      console.log('response', response);
      if (response == null) {
        setFlattenedData([]);
        return;
      }

      const students = (response as ApiResponse<ApiStudent>).records || [];

      // 将学员按首字母分组
      const groupedStudents: StudentsByLetter = {};

      // 初始化字母分组
      ALPHABET.forEach((letter) => {
        groupedStudents[letter] = [];
      });

      // 添加特殊字符分组
      groupedStudents['#'] = [];

      // 处理每个学生数据
      for (const student of students) {
        try {
          // 获取姓名首字母（拼音首字母）
          let name = student.studentNickname;
          
          // 检查名字是否为空
          if (!name) {
            console.log('学生名称为空:', student);
            // 将没有名字的学生归类到'#'分组
            groupedStudents['#'].push({
              id: student.studentId || '',
              name: '未命名学员',
              avatarUrl: student.studentAvatarUrl,
            });
            continue;
          }
          
          let firstLetter = '';

          // 检查是否是中文
          const isChinese = /[\u4e00-\u9fa5]/.test(name);

          if (isChinese) {
            // 使用pinyin-pro获取拼音首字母
            const pinyinStr = pinyin(name, { toneType: 'none' });
            // 检查拼音结果是否有效
            if (pinyinStr && pinyinStr.length > 0) {
              firstLetter = pinyinStr.charAt(0).toUpperCase();
            } else {
              // 如果拼音结果无效，使用#作为分组
              firstLetter = '#';
            }
          } else {
            // 非中文直接获取首字母
            firstLetter = name.charAt(0).toUpperCase();
          }

          // 确定分组字母
          const letter = ALPHABET.includes(firstLetter) ? firstLetter : '#';

          // 初始化分组（如果不存在）
          if (!groupedStudents[letter]) {
            groupedStudents[letter] = [];
          }

          // 添加到对应分组
          console.log('student.nickname', name);

          groupedStudents[letter].push({
            id: student.studentId || '',
            name: student.studentNickname,
            avatarUrl: student.studentAvatarUrl,
          });
        } catch (err) {
          console.error('处理学生数据失败:', err);
          // 将处理失败的学生放入'#'分组
          if (student && student.studentId) {
            groupedStudents['#'].push({
              id: student.studentId || '',
              name: '数据错误',
              avatarUrl: student.studentAvatarUrl,
            });
          }
        }
      }

      // 按字母排序
      const sortedLetters = Object.keys(groupedStudents).sort((a, b) => {
        if (a === '#') return 1; // '#'放在最后
        if (b === '#') return -1;
        return a.localeCompare(b);
      });

      // 展平数据为 FlashList 格式
      const newFlattenedData: Item[] = [];
      sortedLetters.forEach((letter) => {
        // 只添加有学生的分组
        if (groupedStudents[letter].length > 0) {
          // 添加分组头
          newFlattenedData.push({ type: 'header', title: letter, key: `header-${letter}` });

          // 添加学员项
          const studentsInLetter = groupedStudents[letter];
          for (let i = 0; i < studentsInLetter.length; i += 3) {
            newFlattenedData.push({
              type: 'row',
              students: studentsInLetter.slice(i, i + 3),
              key: `row-${letter}-${i}`,
            });
          }
        }
      });

      setFlattenedData(newFlattenedData);
    } catch (err) {
      console.error('获取学员列表失败:', err);
      setError('获取学员列表失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 首次加载和刷新时获取数据
  useEffect(() => {
    fetchStudents();
  }, [onRefresh]);

  // 处理字母选择，滚动到对应分组
  const handleLetterSelect = (letter: string) => {
    console.log('选择字母:', letter);
    setActiveLetter(letter);
    const index = flattenedData.findIndex(
      (item) => item.type === 'header' && item.title === letter
    );
    if (index !== -1 && flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0, // 滚动到顶部
      });
    }
  };

  // 测量字母索引容器的布局
  useEffect(() => {
    if (alphabetContainerRef.current) {
      setTimeout(() => {
        alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          console.log('容器测量:', { height, pageY });
          setAlphabetLayout({ height, y: pageY });
        });
      }, 500);
    }
  }, []);

  // 根据触摸位置找到对应的字母
  const findLetterAtPosition = (touchY: number) => {
    // 如果没有布局信息或高度为0，退出
    if (alphabetLayout.height <= 0) {
      console.log('无效布局信息');
      return;
    }

    // 计算相对于字母索引容器顶部的位置
    const relativeY = touchY - alphabetLayout.y;

    // 计算每个字母的高度
    const letterHeight = alphabetLayout.height / ALPHABET.length;

    // 计算触摸点对应的字母索引
    const index = Math.min(Math.max(Math.floor(relativeY / letterHeight), 0), ALPHABET.length - 1);

    // 找到对应的字母
    const letter = ALPHABET[index];
    console.log(
      '触摸位置:',
      touchY,
      '相对位置:',
      relativeY,
      '字母索引:',
      index,
      '选中字母:',
      letter
    );

    if (letter && letter !== activeLetter) {
      handleLetterSelect(letter);
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e: GestureResponderEvent) => {
    console.log('触摸开始');
    setIsDragging(true);
    findLetterAtPosition(e.nativeEvent.pageY);
  };

  // 处理触摸移动
  const handleTouchMove = (e: GestureResponderEvent) => {
    if (isDragging) {
      console.log('触摸移动');
      findLetterAtPosition(e.nativeEvent.pageY);
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    console.log('触摸结束');
    setIsDragging(false);
    setActiveLetter(null);
  };

  // 渲染字母气泡提示
  const renderLetterBubble = () => {
    if (!activeLetter) return null;

    return (
      <View
        className="absolute right-12 items-center justify-center"
        style={{ top: '40%' }} // 固定在侧边栏中间位置
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Text className="text-2xl font-bold text-white">{activeLetter}</Text>
        </View>
      </View>
    );
  };

  // 单击字母的处理函数
  const handleLetterPress = (letter: string) => {
    handleLetterSelect(letter);
    // 短暂显示后隐藏
    setTimeout(() => setActiveLetter(null), 500);
  };

  // 渲染字母索引项
  const renderLetter = (letter: string) => (
    <TouchableOpacity
      key={letter}
      className="h-5 items-center justify-center"
      onPress={() => handleLetterPress(letter)}>
      <Text
        className={`text-[12px] ${activeLetter === letter ? 'font-bold text-white' : 'text-gray-300'}`}>
        {letter}
      </Text>
    </TouchableOpacity>
  );

  // 渲染列表项（分组头或学员行）
  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === 'header') {
      return (
        <View className="mb-2 px-2">
          <View className="h-6 w-6 items-center justify-center rounded-sm">
            <Text className="text-[14px] text-black">{item.title}</Text>
          </View>
        </View>
      );
    }
    return (
      <View className="mb-4 flex-col flex-wrap gap-3 px-2">
        {item.students?.map((student) => (
          <TouchableOpacity
            key={student.id}
            className="h-[40px] w-full flex-row items-center gap-3 rounded-[12px]"
            onPress={() => handleStudentPress(student.id)}>
            <View className="h-10 w-10 rounded-full">
              {student.avatarUrl ? (
                <Image source={{ uri: student.avatarUrl }} className="h-full w-full rounded-full" />
              ) : (
                <Image
                  source={require('~/assets/images/who/tutor/image.png')}
                  className="h-full w-full"
                />
              )}
            </View>
            <Text className="text-[14px] text-black">{student.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 估算每项高度
  const getItemHeight = (item: Item) => {
    if (item.type === 'header') return 32; // 分组头高度（24 + 8 间距）
    return 48; // 学员行高度（40 + 8 间距）
  };

  // 渲染加载状态
  if (isLoading && flattenedData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1483FD" />
        <Text className="mt-2 text-gray-500">加载中...</Text>
      </View>
    );
  }

  // 渲染错误状态
  if (error && flattenedData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-[#1483FD] px-4 py-2"
          onPress={fetchStudents}>
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 渲染空状态
  if (flattenedData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">暂无学员</Text>
        <TouchableOpacity
          className="mt-4 rounded-lg bg-[#1483FD] px-4 py-2"
          onPress={fetchStudents}>
          <Text className="text-white">刷新</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row">
      {/* FlashList 渲染分组列表 */}
      <FlashList
        ref={flashListRef}
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        estimatedItemSize={48}
        getItemType={(item) => item.type}
        overrideItemLayout={(layout, item) => {
          layout.size = getItemHeight(item);
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* 字母索引侧边栏 */}
      <View className="relative">
        {/* 显示选中字母的气泡 */}
        {renderLetterBubble()}

        {/* 字母索引列表 */}
        <View className="h-full w-12 items-center justify-center">
          <View
            ref={alphabetContainerRef}
            className="items-center justify-center"
            onLayout={() => {
              // 布局完成时测量容器位置
              setTimeout(() => {
                alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  console.log('容器布局更新:', { width, height, pageX, pageY });
                  if (height > 0 && pageY > 0) {
                    setAlphabetLayout({ height, y: pageY });
                  }
                });
              }, 500);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {ALPHABET.map((letter) => renderLetter(letter))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default StudentsManagementWithFlashList;
