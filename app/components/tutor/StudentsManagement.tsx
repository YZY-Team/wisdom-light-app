import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';
cssInterop(Image, { className: 'style' });
// 字母索引数据
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 接口定义
interface Student {
  id: string;
  name: string;
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

// 模拟的学员数据
const STUDENTS: StudentsByLetter = {
  A: [
    { id: 'a1', name: '安妮' },
    { id: 'a2', name: '艾伦' },
    { id: 'a3', name: '阿里' },
    { id: 'a4', name: '艾米' },
    { id: 'a5', name: '艾莉' },
  ],
  B: [
    { id: 'b1', name: '白倩' },
    { id: 'b2', name: '鲍勃' },
    { id: 'b3', name: '比尔' },
    { id: 'b4', name: '贝蒂' },
  ],
  C: [
    { id: 'c1', name: '陈明' },
    { id: 'c2', name: '陈亮' },
    { id: 'c3', name: '程颖' },
    { id: 'c4', name: '崔静' },
    { id: 'c5', name: '曹丽' },
    { id: 'c6', name: '陈曦' },
    { id: 'c7', name: '陈欣' },
  ],
  D: [
    { id: 'd1', name: '董杰' },
    { id: 'd2', name: '杜鹃' },
    { id: 'd3', name: '戴维' },
  ],
  E: [
    { id: 'e1', name: '恩里克' },
    { id: 'e2', name: '埃文' },
  ],
  F: [
    { id: 'f1', name: '冯华' },
    { id: 'f2', name: '方圆' },
    { id: 'f3', name: '范晴' },
    { id: 'f4', name: '费雯' },
  ],
  G: [
    { id: 'g1', name: '高峰' },
    { id: 'g2', name: '郭敏' },
    { id: 'g3', name: '甘琳' },
  ],
  H: [
    { id: 'h1', name: '何强' },
    { id: 'h2', name: '韩梅' },
    { id: 'h3', name: '胡杰' },
    { id: 'h4', name: '黄莉' },
    { id: 'h5', name: '霍华德' },
  ],
  J: [
    { id: 'j1', name: '金鑫' },
    { id: 'j2', name: '贾楠' },
    { id: 'j3', name: '姜晖' },
  ],
  K: [
    { id: 'k1', name: '柯南' },
    { id: 'k2', name: '凯文' },
  ],
  L: [
    { id: 'l1', name: '李明' },
    { id: 'l2', name: '刘洋' },
    { id: 'l3', name: '林峰' },
    { id: 'l4', name: '罗玲' },
    { id: 'l5', name: '梁静' },
    { id: 'l6', name: '卢浩' },
  ],
  M: [
    { id: 'm1', name: '马超' },
    { id: 'm2', name: '孟庆' },
    { id: 'm3', name: '穆清' },
  ],
  N: [
    { id: 'n1', name: '宁波' },
    { id: 'n2', name: '牛莉' },
  ],
  P: [
    { id: 'p1', name: '潘杰' },
    { id: 'p2', name: '彭芳' },
  ],
  Q: [
    { id: 'q1', name: '秦勇' },
    { id: 'q2', name: '钱海' },
    { id: 'q3', name: '曲悦' },
  ],
  R: [
    { id: 'r1', name: '任强' },
    { id: 'r2', name: '饶敏' },
  ],
  S: [
    { id: 's1', name: '孙志' },
    { id: 's2', name: '沈莹' },
    { id: 's3', name: '宋达' },
    { id: 's4', name: '苏楠' },
  ],
  T: [
    { id: 't1', name: '唐进' },
    { id: 't2', name: '田甜' },
    { id: 't3', name: '陶然' },
  ],
  W: [
    { id: 'w1', name: '王伟' },
    { id: 'w2', name: '吴敏' },
    { id: 'w3', name: '魏峰' },
    { id: 'w4', name: '汪洋' },
    { id: 'w5', name: '温婷' },
  ],
  X: [
    { id: 'x1', name: '徐亮' },
    { id: 'x2', name: '谢菲' },
    { id: 'x3', name: '熊猛' },
    { id: 'x4', name: '夏雨' },
  ],
  Y: [
    { id: 'y1', name: '杨光' },
    { id: 'y2', name: '叶青' },
    { id: 'y3', name: '袁媛' },
    { id: 'y4', name: '于海' },
  ],
  Z: [
    { id: 'z1', name: '张华' },
    { id: 'z2', name: '赵明' },
    { id: 'z3', name: '朱丽' },
    { id: 'z4', name: '周杰' },
    { id: 'z5', name: '郑涛' },
    { id: 'z6', name: '邹静' },
  ],
};

// 展平数据为 FlashList 格式
const flattenedData: Item[] = Object.entries(STUDENTS).reduce((acc: Item[], [letter, students]) => {
  // 添加分组头
  acc.push({ type: 'header', title: letter, key: `header-${letter}` });
  // 添加学员项（按原布局，每行最多 3 个）
  const rows: Item[] = [];
  for (let i = 0; i < students.length; i += 3) {
    rows.push({
      type: 'row',
      students: students.slice(i, i + 3),
      key: `row-${letter}-${i}`,
    });
  }
  acc.push(...rows);
  return acc;
}, []);

const StudentsManagementWithFlashList = () => {
  const flashListRef = useRef<FlashList<Item>>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const alphabetContainerRef = useRef<View>(null);
  const [alphabetLayout, setAlphabetLayout] = useState({ height: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

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
          <View className="h-6 w-6  items-center justify-center rounded-sm">
            <Text className="text-[14px] text-black">{item.title}</Text>
          </View>
        </View>
      );
    }
    return (
      <View className="mb-4 flex-col px-2 flex-wrap gap-3">
        {item.students?.map((student) => (
          <TouchableOpacity
            key={student.id}
            className="h-[40px] gap-3 w-full  flex-row items-center rounded-[12px] ">
            <View className=" w-10 h-10 rounded-full ">
              <Image
                source={require('~/assets/images/who/tutor/image.png')}
                className="h-full w-full"
              />
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

  return (
    <View className="flex-1  flex-row">
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
        <View className="h-full w-12 items-center justify-center ">
          <View
            ref={alphabetContainerRef}
            className=" items-center  justify-center"
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
