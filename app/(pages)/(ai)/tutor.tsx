import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import * as schema from '~/db/schema';
import { nanoid } from 'nanoid/non-secure';
import { useDatabase } from '~/contexts/DatabaseContext';
import { fastgptApi } from '../../../api/ai/fastgpt';
import { eq, desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { MessageType } from '~/db/schema';
import { FlashList } from '@shopify/flash-list';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

cssInterop(SafeAreaView, { className: { target: 'style' } });
cssInterop(LinearGradient, { className: { target: 'style' } });

interface MessageProps {
  text: string;
  time: string;
  isUser: boolean;
}

const Message = ({ text, time, isUser }: MessageProps) => {
  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-[#1483FD]">
          <Image source={require('~/assets/images/ai/logo.png')} className="h-full w-full" />
        </View>
      )}
      <View className="max-w-[80%]">
        <View
          className={`px-4 pb-1 pt-5 ${isUser ? 'rounded-bl-xl rounded-br-xl rounded-tl-xl rounded-tr-none bg-[#1483FD]' : 'rounded-bl-xl rounded-br-xl rounded-tl-none rounded-tr-xl bg-white'}`}
          style={{
            shadowColor: isUser ? undefined : 'rgba(82, 100, 255, 0.1)',
            shadowOffset: isUser ? undefined : { width: 0, height: 4 },
            shadowOpacity: isUser ? undefined : 1,
            shadowRadius: isUser ? undefined : 4,
            elevation: isUser ? undefined : 2,
          }}>
          <Text className={`text-sm ${isUser ? 'text-white' : 'text-black'}`}>{text}</Text>
          <Text
            className={`text-right  text-xs ${isUser ? 'text-white/40 ' : 'text-left text-black/40'}`}>
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function TutorScreen() {
  const router = useRouter();
  const { drizzleDb } = useDatabase();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flashListRef = useRef<FlashList<MessageType>>(null);

  // 使用useLiveQuery获取实时消息数据
  const { data: messages } = useLiveQuery(
    drizzleDb!
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.dialogId, 'ai-tutor-chat'))
      .orderBy(desc(schema.messages.timestamp))
  );

  const handleSend = async () => {
    console.log('发送消息');

    if (inputText.trim() && drizzleDb && !isLoading) {
      setIsLoading(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const timestamp = now.getTime();
      const messageId = nanoid();

      try {
        // 创建会话ID
        const dialogId = 'ai-tutor-chat';

        // 检查会话是否存在
        try {
          await drizzleDb
            .insert(schema.conversations)
            .values({
              dialogId: dialogId,
              type: 'AI_CHAT',
              participantId: 'ai-tutor',
              lastMessageContent: inputText,
              lastMessageTime: timestamp,
            })
            .onConflictDoUpdate({
              target: schema.conversations.dialogId,
              set: {
                lastMessageContent: inputText,
                lastMessageTime: timestamp,
              },
            });
        } catch (err) {
          console.log('对话创建/更新出错，继续插入消息', err);
        }

        // 插入用户消息
        await drizzleDb.insert(schema.messages).values({
          id: messageId,
          dialogId: dialogId,
          senderId: 'user',
          receiverId: 'ai-tutor',
          textContent: inputText,
          type: 'AI_CHAT',
          timestamp: timestamp,
          status: 'sent',
        });

        setInputText('');

        // 调用AI接口获取回复
        const apiMessages = [
          // { role: 'system', content: '你是一位友好的AI导师，擅长解答各种问题，并给予专业的指导。' },
          { role: 'user', content: inputText },
        ];

        const response = await fastgptApi.getFastgpt(apiMessages, {}, dialogId);

        if (response && response.choices && response.choices.length > 0) {
          const aiResponse = response.choices[0].message.content;
          const aiMessageId = nanoid();
          const aiTimestamp = Date.now();

          // 保存AI回复到数据库
          await drizzleDb.insert(schema.messages).values({
            id: aiMessageId,
            dialogId: dialogId,
            senderId: 'ai-tutor',
            receiverId: 'user',
            textContent: aiResponse,
            type: 'AI_CHAT',
            timestamp: aiTimestamp,
            status: 'received',
          });

          // 更新对话的最后一条消息
          await drizzleDb
            .update(schema.conversations)
            .set({
              lastMessageContent: aiResponse,
              lastMessageTime: aiTimestamp,
            })
            .where(eq(schema.conversations.dialogId, dialogId));
        }
      } catch (error) {
        console.error('发送消息或获取AI回复错误:', error);
        alert('操作失败：' + error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" >
      <LinearGradient
        colors={['#20B4F3', '#5762FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-1">
        {/* 顶部导航栏 */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="left" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center justify-center gap-4">
              <Image source={require('~/assets/images/ai/logo2.png')} className="h-10 w-10" />
              <Text className="text-[16px] font-semibold text-white">AI导师</Text>
            </View>
            <TouchableOpacity
              className="w-10 flex-col items-center justify-center"
              onPress={() => router.push('/(ai)/report')}>
              <Image
                source={require('~/assets/images/ai/baogao.png')}
                className="h-[21px] w-[19px]"
              />
              <Text className="text-[10px] font-semibold text-white">AI报告</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 聊天内容区域 */}
        <View className="mx-4 my-2 flex-1 rounded-xl bg-[#F6F7FF] p-4">
          <FlashList
            data={messages}
            estimatedItemSize={100}
            ref={flashListRef}
            inverted
            renderItem={({ item }) => (
              <Message
                text={item.textContent || ''}
                time={new Date(item.timestamp || Date.now()).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                isUser={item.senderId === 'user'}
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
          {isLoading && (
            <View className="mb-4 flex-row justify-start">
              <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-[#1483FD]">
                <Image source={require('~/assets/images/ai/logo.png')} className="h-full w-full" />
              </View>
              <View className="max-w-[80%]">
                <View
                  className="rounded-bl-xl rounded-br-xl rounded-tl-none rounded-tr-xl bg-white px-4 pb-1 pt-5"
                  style={{
                    shadowColor: 'rgba(82, 100, 255, 0.1)',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                  <Text className="text-sm text-black">正在思考中...</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 底部输入区域 */}
        <View className="px-4 pb-6 pt-2">
          <View className="flex-row items-center">
            <View
              className="flex-1 flex-row rounded-[22px] bg-white shadow-md"
              style={{
                shadowColor: 'rgba(82, 100, 255, 0.1)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <TextInput
                className="flex-1 px-4 py-3 text-sm text-black"
                placeholder="请输入问题..."
                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!isLoading}
              />
              <TouchableOpacity
                className={`h-10 w-10 items-center justify-center rounded-full bg-white ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleSend}
                disabled={isLoading}>
                <View className="relative">
                  <Image source={require('../../../assets/images/vector8.svg')} className="h-5 w-5" />
                  <Image
                    source={require('../../../assets/images/ai/shang.png')}
                    className="absolute h-5 w-5"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
