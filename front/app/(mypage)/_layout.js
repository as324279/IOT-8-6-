import { Stack, useRouter } from 'expo-router';
import TopHeader from '../../components/TopHeader';

export default function MyPageLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        header: ({ navigation, options }) => (
          <TopHeader
            title={options.title} // 헤더 제목 title
            showIcons={options.showIcons || false} 
            showBack={navigation.canGoBack()} 
            onBackPress={() => navigation.goBack()}
          />
        ),
      }}
    >
      <Stack.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          showIcons: true, 
        }}
      />
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