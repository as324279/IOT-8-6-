import { FontAwesome5, Fontisto, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="mainHome"
        options={{
          title:'홈',
          tabBarLabel:'홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shoppingHome"
        options={{
          title:'쇼핑리스트',
          tabBarLabel:'쇼핑리스트',
          tabBarIcon: ({ color, size }) => (
            <Fontisto name="shopping-basket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="userHome"
        options={{
          title:'마이페이지',
          tabBarLabel:'마이페이지',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
