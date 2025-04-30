import {
  View,
  Text,
  Pressable,
  TextInput,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { memo, useRef, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import type { Friend } from '~/types/have/friendType';
import { pinyin } from 'pinyin-pro';

// 字母索引数据
const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // 添加 '#' 用于特殊情况

// 接口定义
interface FriendGroup {
  [key: string]: Friend[];
}

interface Item {
  type: string;
  key: string;
  title?: string;
  friends?: Friend[];
}

// 按字母分组数据
const groupFriendsByLetter = (friends: Friend[]): FriendGroup => {
  const grouped: FriendGroup = {};

  // 初始化每个字母的分组
  ALPHABET.forEach((letter) => {
    grouped[letter] = [];
  });

  // 按首字母分组
  friends.forEach((friend) => {
    // 优先使用 nickname，如果为空则使用 username（去掉"用户"前缀）
    let name = friend.nickname || friend.username.replace('用户', '');
    let firstLetter = '';

    // 检查是否是中文（使用正则匹配中文字符）
    const isChinese = /[\u4e00-\u9fa5]/.test(name);

    if (isChinese) {
      // 获取拼音（无音调）
      const pinyinStr = pinyin(name, { toneType: 'none' });
      // 取第一个字的拼音首字母
      firstLetter = pinyinStr.split(' ')[0][0].toUpperCase();
    } else {
      // 非中文，直接取首字母
      firstLetter = name.charAt(0).toUpperCase();
    }

    // 确保首字母在 A-Z 范围内
    if (ALPHABET.includes(firstLetter)) {
      grouped[firstLetter].push(friend);
    }
  });

  // 过滤掉没有好友的字母组
  Object.keys(grouped).forEach((letter) => {
    if (grouped[letter].length === 0) {
      delete grouped[letter];
    }
  });

  return grouped;
};

// 展平数据为 FlashList 格式
const flattenGroupedData = (groupedData: FriendGroup): Item[] => {
  return Object.entries(groupedData).reduce((acc: Item[], [letter, friends]) => {
    // 添加分组头
    acc.push({ type: 'header', title: letter, key: `header-${letter}` });
    // 添加好友项（每行一个）
    friends.forEach((friend, index) => {
      acc.push({
        type: 'item',
        friends: [friend],
        key: `item-${letter}-${index}`,
      });
    });
    return acc;
  }, []);
};

// 好友项组件
const FriendItem = memo(({ item }: { item: Friend }) => (
  <Pressable
    className="flex-row items-center bg-white py-3"
    onPress={() => {
      router.push({
        pathname: '/friend-detail',
        params: { friendId: item.userId, friendInfo: JSON.stringify(item) },
      });
    }}>
    <Image
      source={{ uri: item.avatarUrl }}
      className="h-12 w-12 rounded-full"
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium">{item.nickname}</Text>
    </View>
  </Pressable>
));

// 分组标题组件
const GroupHeader = memo(({ letter }: { letter: string }) => (
  <View className="mb-2 px-2">
    <View className="h-6 w-6 items-center justify-center rounded-sm">
      <Text className="text-[14px] text-black">{letter}</Text>
    </View>
  </View>
));

interface FriendTabProps {
  friends: Friend[];
  searchText: string;
}

export default function FriendTab({ friends, searchText }: FriendTabProps) {
  const flashListRef = useRef<FlashList<Item>>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const alphabetContainerRef = useRef<View>(null);
  const [alphabetLayout, setAlphabetLayout] = useState({ height: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 根据搜索文本过滤好友
  const filteredFriends = friends.filter((friend: Friend) => {
    const searchLower = searchText.toLowerCase();
    return (
      friend.nickname?.toLowerCase().includes(searchLower) ||
      friend.username?.toLowerCase().includes(searchLower) ||
      friend.remark?.toLowerCase().includes(searchLower)
    );
  });

  // 生成并展平数据
  const groupedData = groupFriendsByLetter(filteredFriends);
  const flattenedData = flattenGroupedData(groupedData);

  // 处理字母选择，滚动到对应分组
  const handleLetterSelect = (letter: string) => {
    setActiveLetter(letter);
    const index = flattenedData.findIndex(
      (item) => item.type === 'header' && item.title === letter
    );
    if (index !== -1 && flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  // 测量字母索引容器的布局
  useEffect(() => {
    if (alphabetContainerRef.current) {
      setTimeout(() => {
        alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setAlphabetLayout({ height, y: pageY });
        });
      }, 500);
    }
  }, []);

  // 根据触摸位置找到对应的字母
  const findLetterAtPosition = (touchY: number) => {
    if (alphabetLayout.height <= 0) return;

    const relativeY = touchY - alphabetLayout.y;
    const letterHeight = alphabetLayout.height / ALPHABET.length;
    const index = Math.min(Math.max(Math.floor(relativeY / letterHeight), 0), ALPHABET.length - 1);
    const letter = ALPHABET[index];

    if (letter && letter !== activeLetter) {
      handleLetterSelect(letter);
    }
  };

  // 处理触摸事件
  const handleTouchStart = (e: GestureResponderEvent) => {
    setIsDragging(true);
    findLetterAtPosition(e.nativeEvent.pageY);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (isDragging) {
      findLetterAtPosition(e.nativeEvent.pageY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setActiveLetter(null);
  };

  // 渲染字母气泡提示
  const renderLetterBubble = () => {
    if (!activeLetter) return null;

    return (
      <View className="absolute right-12 items-center justify-center" style={{ top: '40%' }}>
        <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Text className="text-2xl font-bold text-white">{activeLetter}</Text>
        </View>
      </View>
    );
  };

  // 渲染字母索引项
  const renderLetter = (letter: string) => (
    <TouchableOpacity
      key={letter}
      className="h-5 items-center justify-center"
      onPress={() => handleLetterSelect(letter)}>
      <Text
        className={`text-[12px] ${activeLetter === letter ? 'font-bold text-white' : 'text-gray-300'}`}>
        {letter}
      </Text>
    </TouchableOpacity>
  );

  // 渲染列表项
  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === 'header') {
      return <GroupHeader letter={item.title || ''} />;
    }
    return (
      <View>{item.friends?.map((friend) => <FriendItem key={friend.userId} item={friend} />)}</View>
    );
  };

  // 估算每项高度
  const getItemHeight = (item: Item) => {
    if (item.type === 'header') return 32;
    return 72; // 好友项高度
  };

  if (flattenedData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">暂无好友</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlashList
        ref={flashListRef}
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        estimatedItemSize={72}
        getItemType={(item) => item.type}
        overrideItemLayout={(layout, item) => {
          layout.size = getItemHeight(item);
        }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
      />

      {/* 字母索引侧边栏 */}
      <View className="absolute bottom-0 right-0 top-0 w-12 items-center justify-center">
        {/* 显示选中字母的气泡 */}
        {renderLetterBubble()}

        {/* 字母索引列表 */}
        <View
          ref={alphabetContainerRef}
          className="items-center justify-center"
          onLayout={() => {
            setTimeout(() => {
              alphabetContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
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
  );
} 