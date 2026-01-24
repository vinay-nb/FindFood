import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MultiLocationInputs from "./src/components/MultiLocationInputs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ResultsScreen from "./src/components/ResultsScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PlaceDetailScreen from "./src/components/PlaceDetailsScreen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import AuthScreen from "@/components/GoogleSso";
import Config from "@/config";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/api/supbase";
import { View, ActivityIndicator } from "react-native";

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === "dark";
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.webClientId,
      iosClientId: Config.googleSsoIosClientId,
      offlineAccess: true,
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Input"
            screenOptions={{
              // This applies safe area logic and styling to ALL headers
              headerStyle: {
                backgroundColor: isDarkMode ? "#121212" : "#ffffff",
              },
              headerTintColor: isDarkMode ? "#fff" : "#000",
            }}
          >
            <Stack.Screen
              name="Input"
              component={MultiLocationInputs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PlaceDetail"
              component={PlaceDetailScreen}
              options={{
                headerShown: false,
              }}
            />
            {!session && (
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ headerShown: false }}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
