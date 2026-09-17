import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '../storage';

export type RootStackParamList = {
  Home: undefined;
  LogFood: undefined;
};

type Props = StackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('User');

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const profile = await getUserProfile();
        if (profile && profile.name) {
          setUserName(profile.name); 
        }
      };
      loadProfile();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <Text style={styles.title}>Ready to learn{'\n'}something tasty?</Text>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakTitleRow}>
              <Text style={styles.fireIcon}>🔥</Text>
              <Text style={styles.streakTitle}>4-day streak</Text>
            </View>
            <Text style={styles.keepItUp}>Keep it up</Text>
          </View>
          <View style={styles.daysRow}>
            {['M', 'T', 'W', 'T'].map((day, index) => (
              <View key={`completed-${index}`} style={styles.dayContainer}>
                <View style={[styles.dayBox, styles.dayBoxCompleted]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
            <View style={styles.dayContainer}>
              <View style={[styles.dayBox, styles.dayBoxToday]} />
              <Text style={[styles.dayLabel, styles.dayLabelFaded]}>F</Text>
            </View>
            {['S', 'S'].map((day, index) => (
              <View key={`future-${index}`} style={styles.dayContainer}>
                <View style={[styles.dayBox, styles.dayBoxFuture]} />
                <Text style={[styles.dayLabel, styles.dayLabelFaded]}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.hugeTitle}>Learn{'\n'}as you{'\n'}Eat</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate('LogFood')} 
          >
            <Text style={styles.buttonText}>🥗 Explore a food</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20 },
  header: { marginBottom: 30 },
  greeting: { fontSize: 16, fontWeight: '600', color: '#508933', marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '800', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', lineHeight: 40 },
  streakCard: { backgroundColor: '#F1F7EE', borderRadius: 20, padding: 20, marginBottom: 40 },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  streakTitleRow: { flexDirection: 'row', alignItems: 'center' },
  fireIcon: { fontSize: 18, marginRight: 8 },
  streakTitle: { fontSize: 16, fontWeight: '700', color: '#1B3113' },
  keepItUp: { fontSize: 14, fontWeight: '600', color: '#508933' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayContainer: { alignItems: 'center' },
  dayBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  dayBoxCompleted: { backgroundColor: '#35631D' },
  checkIcon: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  dayBoxToday: { backgroundColor: '#DDF0CF', borderWidth: 1.5, borderColor: '#608D43' },
  dayBoxFuture: { backgroundColor: '#E4ECE0' },
  dayLabel: { fontSize: 12, fontWeight: '700', color: '#35631D' },
  dayLabelFaded: { color: '#A0B298' },
  actionSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  hugeTitle: { fontSize: 65, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', lineHeight: 70, marginBottom: 40 },
  button: { backgroundColor: '#EF7E22', paddingVertical: 18, paddingHorizontal: 32, borderRadius: 30, width: '90%', alignItems: 'center', shadowColor: '#EF7E22', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});