import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MultiLocationInputs from './src/components/MultiLocationInputs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ResultsScreen from './src/components/ResultsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PlaceDetailScreen from './src/components/PlaceDetailsScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Input"
            screenOptions={{
              // This applies safe area logic and styling to ALL headers
              headerStyle: {
                backgroundColor: isDarkMode ? '#121212' : '#ffffff',
              },
              headerTintColor: isDarkMode ? '#fff' : '#000',
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
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
