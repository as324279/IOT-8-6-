import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      
      <Stack.Screen 
        name="index" // FirstScreen 파일명(index.js)에 해당
        options={{
          headerShown: false, // 헤더 숨기기 (이미지처럼 깨끗한 화면)
          title: 'Welcome'
        }}
      />

      <Stack.Screen 
        name="(auth)" 
        options={{
          headerShown: false, // 헤더 숨기기 (이미지처럼 깨끗한 화면)
          title: ''
        }}
      />
      
      
    </Stack>
  );
}