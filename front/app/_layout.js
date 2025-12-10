import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../components/AuthProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: "Welcome",
            }}
          />

          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              title: "",
            }}
          />

          <Stack.Screen
            name="(mypage)"
            options={{
              headerShown: false,
              title: "",
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}