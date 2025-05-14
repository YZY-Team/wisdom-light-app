import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// 启用nativewind的CSS类名支持
cssInterop(LinearGradient, { className: 'style' });

// 模拟的提现历史数据
const WITHDRAWAL_HISTORY = [
    { id: '1', amount: '1.43', orderId: '3249014101', date: '2025-02-23', status: '提现中' },
    { id: '2', amount: '1.43', orderId: '3249014101', date: '2025-02-23', status: '提现成功' },
    { id: '3', amount: '1.43', orderId: '3249014101', date: '2025-02-23', status: '提现失败' },
];

export default function IncomeManagement() {
    const [amount, setAmount] = React.useState('');
    const balance = 10.05; // 模拟的收入余额

    return (
        <View className="flex-1  p-4 gap-4">
            {/* 我的收入卡片 */}
            <LinearGradient
                colors={['#20B4F3', '#5762FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-[6px] p-4"
                style={{
                    boxShadow: "0px 6px 10px 0px rgba(20, 131, 253, 0.40)"
                }}
            >
                <Text className="text-white text-[12px]">我的收入</Text>
                <Text className="text-white text-[32px] font-bold mt-1">{balance.toFixed(2)}</Text>

                {/* 背景装饰 */}
                <View className="absolute bottom-4 right-4 opacity-10">
                    <Text className="text-white text-[40px]">¥</Text>
                </View>
            </LinearGradient>

            {/* 提现输入框和按钮 */}
            <View className="relative h-[44px]">
                <TextInput
                    className="h-full w-full bg-white pl-4 pr-20  rounded-[6px] border border-gray-200"
                    placeholder="输入提现金额，保留两位小数"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}

                />
                <TouchableOpacity
                    disabled={!amount}
                    className="absolute right-0 top-0 h-full"
                >
                    <LinearGradient
                        colors={['#FFE062', '#FF9327']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className={`rounded-r-[6px] w-[80px] h-full justify-center items-center `}
                        style={{
                            boxShadow: "0px 6px 10px 0px rgba(253, 171, 20, 0.40)"
                        }}
                    >
                        <Text className="text-white text-[16px] font-bold">提现</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* 提现历史标题 */}
            <View className="border-l-4 border-[#1483FD] pl-2 py-1">
                <Text className="text-black text-[16px] font-bold">提现历史列表</Text>
            </View>

            {/* 提现历史列表 */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                    {WITHDRAWAL_HISTORY.map((item) => (
                        <View
                            key={item.id}
                            className="bg-white rounded-[6px] p-4 flex-row justify-between items-center"
                            style={{
                                shadowColor: 'rgba(0, 0, 0, 0.05)',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 1,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <View className="flex-1">
                                <View className="flex-row items-center ">
                                    <Text className="text-black text-[12px] ">提现金额 : </Text>
                                    <Text className="text-black text-[14px] font-semibold">¥{item.amount}</Text>
                                </View>
                                <Text className="text-[rgba(0,0,0,0.5)] text-[12px]">订单号：{item.orderId}</Text>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-[rgba(0,0,0,0.5)] text-[12px]">提现时间：{item.date}</Text>
                                    <View className="flex-row items-center">
                                        <Text className={`text-[12px] font-medium `}>
                                            状态 :{" "}
                                        </Text>
                                        <Text className={`text-[12px] font-medium ${item.status === '提现中' ? 'text-orange-500' : item.status === '提现成功' ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>

                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
} 