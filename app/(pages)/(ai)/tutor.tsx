import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

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
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<MessageProps[]>([
        {
            text: '你好！我是Wisdom Light的AI助手。今天我能为你提供什么帮助？',
            time: '14:00',
            isUser: false
        },
        {
            text: '我想了解如何更好地管理我的时间',
            time: '14:01',
            isUser: true
        },
        {
            text: '时间管理是提高效率的关键。我推荐你可以尝试以下方法：\n1. 使用番茄工作法，25分钟专注工作，然后休息5分钟\n2. 建立每日优先级清单，先完成重要且紧急的任务\n3. 减少干扰源，如手机通知等\n4. 定期回顾和调整你的时间分配方式\n\n此外，我看到我们平台有一门"高效时间管理"的课程，由王导师授课，评分很高，你可能会感兴趣。',
            time: '14:02',
            isUser: false
        }
    ]);

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage = {
                text: inputText,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                isUser: true
            };
            setMessages([...messages, newMessage]);
            setInputText('');
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


