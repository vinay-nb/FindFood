import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MultiLocationInputs from './src/components/MultiLocationInputs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ResultsScreen from './src/components/ResultsScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
              options={{ title: 'Find Midway' }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Fairness Rankings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
