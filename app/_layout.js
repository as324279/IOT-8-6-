import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      
      <Stack.Screen 
        name="index" 
        options={{
          headerShown: false, 
          title: 'Welcome'
        }}
      />

      <Stack.Screen 
        name="(auth)" 
        options={{
          headerShown: false, 
          title: ''
        }}
      />

      <Stack.Screen 
        name="mainHome" 
        options={{
          headerShown: false,
          title: ''
        }}
      />

    <Stack.Screen 
        name="(tabs)" 
        options={{
          headerShown: false,
          title: ''
        }}
      />
      
      
    </Stack>
  );
}
