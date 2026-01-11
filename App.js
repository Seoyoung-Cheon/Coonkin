import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          LeeSeoYun: require('./assets/fonts/LeeSeoYun.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('폰트 로드 실패:', error);
        setFontsLoaded(true); // 폰트 로드 실패해도 앱은 계속 실행
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // 또는 로딩 화면 표시
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ff6b35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'COOKIN' }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
