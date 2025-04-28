import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import * as schema from '~/db/schema';
import { nanoid } from 'nanoid/non-secure';
import { useDatabase } from '~/contexts/DatabaseContext';

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
                <View className="w-10 h-10 rounded-full bg-[#1483FD] mr-2 items-center justify-center">
                    <Image
                        source={require('~/assets/images/ai/logo.png')}
                        className="w-full h-full"
                    />
                </View>
            )}
            <View className="max-w-[80%]">
                <View
                    className={`px-4 pt-5 pb-1 ${isUser ? 'bg-[#1483FD] rounded-tl-xl rounded-tr-none rounded-bl-xl rounded-br-xl' : 'bg-white rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-xl'}`}
                    style={{
                        shadowColor: isUser ? undefined : 'rgba(82, 100, 255, 0.1)',
                        shadowOffset: isUser ? undefined : { width: 0, height: 4 },
                        shadowOpacity: isUser ? undefined : 1,
                        shadowRadius: isUser ? undefined : 4,
                        elevation: isUser ? undefined : 2
                    }}
                >
                    <Text className={`text-sm ${isUser ? 'text-white' : 'text-black'}`}>
                        {text}
                    </Text>
                    <Text className={`text-xs  text-right ${isUser ? 'text-white/40 ' : 'text-black/40 text-left'}`}>
                        {time}
                    </Text>
                </View>

            </View>
        </View>
    );
};

export default function TutorScreen() {
    const router = useRouter();
    const { db, drizzleDb, isInitialized } = useDatabase();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<MessageProps[]>([]);

    useEffect(() => {
        if (!isInitialized || !db) return;
        
        // 获取消息
        const fetchMessages = async () => {
            try {
                // 使用原生SQL查询
                const result = await db.getAllSync('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50');
                
                setMessages(
                    result.map((m: any) => ({
                        text: m.text_content || m.textContent || '',
                        time: m.time || new Date(m.timestamp || Date.now()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                        isUser: Boolean(m.isUser === 1 || m.senderId === 'user')
                    }))
                );
            } catch (error) {
                console.error('获取消息失败:', error);
            }
        };
        
        fetchMessages();
    }, [db, isInitialized]);

    const handleSend = async () => {
        console.log("发送消息");
        
        if (inputText.trim() && drizzleDb) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            const timestamp = now.getTime();
            const messageId = nanoid();
            
            const newMessage = { 
                text: inputText, 
                time: timeString, 
                isUser: true 
            };
            
            try {
                // 创建会话ID
                const dialogId = 'ai-tutor-chat';
                
                // 检查会话是否存在
                try {
                    await drizzleDb.insert(schema.conversations).values({
                        dialogId: dialogId,
                        type: 'AI_CHAT',
                        participantId: 'ai-tutor',
                        lastMessageContent: inputText,
                        lastMessageTime: timestamp,
                    }).onConflictDoUpdate({
                        target: schema.conversations.dialogId,
                        set: {
                            lastMessageContent: inputText,
                            lastMessageTime: timestamp,
                        }
                    });
                } catch (err) {
                    console.log('对话创建/更新出错，继续插入消息', err);
                }
                
                // 插入消息
                await drizzleDb.insert(schema.messages).values({
                    id: messageId,
                    dialogId: dialogId,
                    senderId: 'user',
                    receiverId: 'ai-tutor',
                    textContent: inputText,
                    type: 'AI_CHAT',
                    timestamp: timestamp,
                    status: 'sent'
                });
                
                setMessages(prev => [...prev, newMessage]);
                setInputText('');
            } catch (error) {
                console.error('发送消息错误:', error);
                alert('发送消息失败：' + error);
            }
        }
    };

    return (
        <LinearGradient
            colors={['#20B4F3', '#5762FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                {/* 顶部导航栏 */}
                <View className="px-4  py-4">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.back()}>
                            <AntDesign name="left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View className='flex-1 flex-row items-center gap-4 justify-center'>
                            <Image source={require('~/assets/images/ai/logo2.png')} className='w-10 h-10' />
                            <Text className="text-white text-[16px]  font-semibold">AI导师</Text>
                        </View>
                        <TouchableOpacity className='flex-col w-10 justify-center items-center' onPress={() => router.push('/(ai)/report')}>
                            <Image source={require('~/assets/images/ai/baogao.png')} className='w-[19px] h-[21px] ' />
                            <Text className='text-white text-[10px] font-semibold'>AI报告</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 聊天内容区域 */}
                <View className="flex-1 bg-[#F6F7FF] rounded-xl mx-4 my-2 p-4">
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {messages.map((message, index) => (
                            <Message
                                key={index}
                                text={message.text}
                                time={message.time}
                                isUser={message.isUser}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* 底部输入区域 */}
                <View className="px-4 pb-6 pt-2">
                    <View className="flex-row items-center">
                        <View className="flex-1  flex-row bg-white rounded-[22px] shadow-md"
                            style={{
                                shadowColor: 'rgba(82, 100, 255, 0.1)',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 1,
                                shadowRadius: 4,
                                elevation: 2
                            }}
                        >
                            <TextInput
                                className="px-4 flex-1 py-3 text-sm text-black"
                                placeholder="请输入问题..."
                                placeholderTextColor="rgba(30, 30, 30, 0.5)"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity
                                className="bg-white w-10 h-10 rounded-full items-center justify-center"
                                onPress={handleSend}
                            >
                                <View className="relative">
                                    <Image
                                        source={require('../../../assets/images/vector8.svg')}
                                        className="w-5 h-5"
                                    />
                                    <Image
                                        source={require('../../../assets/images/ai/shang.png')}
                                        className="w-5 h-5 absolute"
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}


