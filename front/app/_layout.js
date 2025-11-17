import { Stack } from "expo-router";
import { AuthProvider } from "../components/AuthProvider";

export default function RootLayout() {
  return (
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
  );
}