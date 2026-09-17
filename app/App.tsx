import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler'; 
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; 

import HomeScreen from './src/screens/HomeScreen';
import LogFoodScreen from './src/screens/LogFoodScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FoodDetailScreen from './src/screens/FoodDetailScreen';
import ProductOverviewScreen from './src/screens/ProductOverviewScreen';
import OnboardingScreen from './src/screens/OnboardingScreen'; 
import ProfileScreen from './src/screens/ProfileScreen';
import { getUserProfile } from './src/storage'; 


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'LogFood') iconName = focused ? 'scan' : 'scan-outline';
          else if (route.name === 'History') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EF7E22', 
        tabBarInactiveTintColor: '#A0B298', 
        tabBarStyle: {
          backgroundColor: '#FFFBF5', 
          borderTopColor: '#E4ECE0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="LogFood" component={LogFoodScreen} options={{ tabBarLabel: 'Scan' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const profile = await getUserProfile();

      // if (profile && profile.hasOnboarded) {
      //   setHasOnboarded(true);
      // }

      setIsReady(true);
    };
    checkOnboarding();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFBF5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF7E22" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Tabs" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="FoodDetail" 
          component={FoodDetailScreen} 
          options={{ 
            headerShown: true, 
            headerTitle: '',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: '#FFFBF5', elevation: 0, shadowOpacity: 0 },
            headerTintColor: '#1B3113', 
          }} 
        />
        <Stack.Screen 
          name="ProductOverview" 
          component={ProductOverviewScreen} 
          options={{ 
            headerShown: true, 
            headerTitle: '',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: '#FFFBF5', elevation: 0, shadowOpacity: 0 },
            headerTintColor: '#1B3113', 
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}