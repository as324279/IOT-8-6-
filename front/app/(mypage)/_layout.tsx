import React from 'react'; // React 명시적 임포트
import { Stack, useRouter } from 'expo-router';
import TopHeader from '../../components/TopHeader';

const MyPageLayout: React.FC = () => {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        header: ({ navigation, options }) => (
          <TopHeader
            title={options.title as string} 
            showIcons={(options as any).showIcons || false} 
            showBack={navigation.canGoBack()} 
            onBackPress={() => navigation.goBack()} 
            onNotificationPress={() => {}}
          />
        ),
      }}
    >
      
      <Stack.Screen
        name="passwordChange"
        options={{ title: '비밀번호 변경' }}
      />
      <Stack.Screen
        name="notificationSettings"
        options={{ title: '알림 설정' }}
      />
      <Stack.Screen
        name="noticeScreen"
        options={{ title: '공지사항' }}
      />
      <Stack.Screen
        name="inquiryScreen"
        options={{ title: '서비스 문의' }}
      />
    </Stack>
  );
}
export default MyPageLayout;