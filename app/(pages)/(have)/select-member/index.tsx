import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { memo, useRef, useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Friend } from '~/types/have/friendType';
import { pinyin } from 'pinyin-pro';
import Checkbox from '~/components/ui/Checkbox';
import { friendApi } from '~/api/have/friend';
import { dialogApi } from '~/api/have/dialog';

// 字母索引数据
const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 按字母分组数据
const groupFriendsByLetter = (friends: Friend[]) => {
  const grouped: { [key: string]: Friend[] } = {};

  ALPHABET.forEach((letter) => {
    grouped[letter] = [];
  });

  friends.forEach((friend) => {
    let name = friend.nickname || friend.username.replace('用户', '');
    let firstLetter = '';

    const isChinese = /[\u4e00-\u9fa5]/.test(name);

    if (isChinese) {
      const pinyinStr = pinyin(name, { toneType: 'none' });
      firstLetter = pinyinStr.split(' ')[0][0].toUpperCase();
    } else {
      firstLetter = name.charAt(0).toUpperCase();
    }

    if (ALPHABET.includes(firstLetter)) {
      grouped[firstLetter].push(friend);
    }
  });

  Object.keys(grouped).forEach((letter) => {
    if (grouped[letter].length === 0) {
      delete grouped[letter];
    }
  });

  return grouped;
};

// 展平数据
const flattenGroupedData = (groupedData: { [key: string]: Friend[] }) => {
  return Object.entries(groupedData).reduce((acc: any[], [letter, friends]) => {
    acc.push({ type: 'header', title: letter, key: `header-${letter}` });
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
const FriendItem = memo(({ item, selected, onToggle }: { item: Friend; selected: boolean; onToggle: () => void }) => (
  <TouchableOpacity
    className="flex-row items-center bg-white py-3 px-4"
    onPress={onToggle}>
    <Checkbox checked={selected} onChange={onToggle} />
    <Image
      source={{ uri: item.avatarUrl }}
      className="ml-3 h-12 w-12 rounded-full"
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium">{item.nickname}</Text>
    </View>
  </TouchableOpacity>
));

// 分组标题组件
const GroupHeader = memo(({ letter }: { letter: string }) => (
  <View className="mb-2 px-4">
    <View className="h-6 w-6 items-center justify-center rounded-sm">
      <Text className="text-[14px] text-black">{letter}</Text>
    </View>
  </View>
));

export default function SelectMember() {
  const params = useLocalSearchParams();
  const { groupId } = params;
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await friendApi.getFriends();
        setFriends(response.data || []);
      } catch (error) {
        console.error('获取好友列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // 生成并展平数据
  const groupedData = groupFriendsByLetter(friends);
  const flattenedData = flattenGroupedData(groupedData);

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  // 处理添加群成员
  const handleAddMembers = async () => {
    console.log('selectedMembers', selectedMembers);
    if (selectedMembers.size === 0 || !groupId) return;
    
    setAdding(true);
    try {
      const selectedIds = Array.from(selectedMembers);
      const res=await dialogApi.addGroupMembers(groupId as string, selectedIds);
      if(res.code===200){
        router.back();
      } else {
        console.error('添加群成员失败:', res.message);
      }
    } catch (error) {
      console.error('添加群成员失败:', error);
    } finally {
      setAdding(false);
    }
  };

  // 渲染列表项
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return <GroupHeader letter={item.title} />;
    }
    const friend = item.friends[0];
    return (
      <FriendItem
        item={friend}
        selected={selectedMembers.has(friend.userId)}
        onToggle={() => toggleMember(friend.userId)}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* 顶部导航栏 */}
      <View className="relative flex-row items-center justify-between px-4 py-3 bg-white">
        <Pressable
          onPress={() => router.back()}
          className="z-10 justify-center">
          <Ionicons name="chevron-back" size={24} color="#666" />
        </Pressable>
        <Text className="text-lg font-medium">选择联系人</Text>
        <TouchableOpacity
          onPress={handleAddMembers}
          disabled={selectedMembers.size === 0 || adding}
          className={`${selectedMembers.size > 0 && !adding ? 'opacity-100' : 'opacity-50'}`}>
          <Text className="text-blue-500">
            {adding ? '添加中...' : `确定(${selectedMembers.size})`}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">加载中...</Text>
        </View>
      ) : (
        <FlashList
          data={flattenedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          estimatedItemSize={72}
          getItemType={(item) => item.type}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
