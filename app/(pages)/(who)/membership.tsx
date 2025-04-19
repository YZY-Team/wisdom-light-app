import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/nativewindui/Text';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });

export default function MembershipScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(0); // 默认选中第一个选项
  
  const membershipPlans = [
    { duration: '3个月VIP', price: '￥199' },
    { duration: '6个月VIP', price: '￥499' },
    { duration: '12个月VIP', price: '￥899' }
  ];
  
  return (
    <View className='flex-1 bg-white'>{/* 顶部导航栏 */}
      <View className="px-4  py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="left" size={24} color="#00000080" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[16px] ">会员详情</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <View className="flex-1 px-8 py-4">
        {/* VIP 会员卡片 */}
        <View className="  w-full  aspect-[323/149]  ">
          <Image source={require('~/assets/images/who/vip/vipBg.png')} className="w-full h-full" />
          <View className='absolute top-1 left-0 w-[113px]  aspect-[113/30]'>
            <Image source={require('~/assets/images/who/vip/vipBgLeft.png')} className='w-full opacity-50 h-full' />
           <View className='absolute top-0 left-0  w-full h-full items-start  flex   justify-center'>
           <Text className=' pl-[20%] text-center text-[12px] '>未开通</Text>
           </View>
          </View>
          <View className='absolute top-[72%] border bg-[#FFF] border-[#B0B0B0] rounded-[6px] flex items-center justify-center left-[15%] w-[48px]  aspect-[48/19]'>
            <Text className='text-[12px] text-[#B4B4B4]'>12个月</Text>
          </View>
        </View>
        {/* 会员选项 */}
        <View className="flex-row  mt-4 mb-12 gap-3">
          {membershipPlans.map((plan, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-1 rounded-[6px] p-4 items-center ${selectedPlan === index ? 'bg-[#FFD95D]' : 'bg-black/5'}`}
              onPress={() => setSelectedPlan(index)}
            >
              <Text className="text-[12px] mb-3 text-center">{plan.duration}</Text>
              <Text className="text-[24px] font-semibold">{plan.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* 会员权益 */}
        <View className='flex-row items-center gap-2'>
          <Image source={require('~/assets/images/who/vip/logo.png')} className='w-7 h-6' />
          <Text className="text-[16px] font-bold mb-2">会员权益：</Text>
        </View>
        <View className="gap-1 mb-6">
          <Text className="text-[12px]">1. 有效期{membershipPlans[selectedPlan].duration}</Text>
          <Text className="text-[12px]">2. 可用宣告模块</Text>
          <Text className="text-[12px]">3. 可看全部视频课程</Text>
          <Text className="text-[12px]">4. 可支付预约线上课程</Text>
          <Text className="text-[12px]">5. 可付费咨询导师</Text>
          <Text className="text-[12px]">6. 可使用AI导师无限次/天</Text>
          <Text className="text-[12px]">7. 可加好友</Text>
          <Text className="text-[12px]">8. 可在聊天广场发言</Text>
        </View>

        {/* 确认按钮 */}
        <LinearGradient
          colors={['#FFE062', '#FF9327']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-[6px] mt-auto mb-6"
          style={{
            boxShadow:"0px 6px 10px 0px rgba(253, 171, 20, 0.40)"
          }}
        >
          <TouchableOpacity 
            className="p-4 items-center"
            onPress={() => {
              // TODO: Implement payment with selectedPlan
              console.log('选择的会员计划:', membershipPlans[selectedPlan]);
            }}
          >
            <Text className="text-[20px] text-white font-bold">确认开通</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View></View>
  );
}