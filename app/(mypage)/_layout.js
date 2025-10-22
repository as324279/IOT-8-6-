import { Stack } from 'expo-router';

export default function MyPageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="mypage"
        options={{ title: '마이페이지' }}
      />

      <Stack.Screen
        name="passwordChange"
        options={{ title: '비밀번호 변경' }}
      />
      <Stack.Screen
        name="notificationSettings"
        options={{ title: '알림 설정' }}
      />
    </Stack>
  );
}
