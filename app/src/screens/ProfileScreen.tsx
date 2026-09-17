import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile, saveUserProfile, UserProfile } from '../storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  // Full profile state to ensure we don't overwrite unrelated data (like name or macros)
  const [fullProfile, setFullProfile] = useState<Partial<UserProfile>>({});
  
  const [language, setLanguage] = useState<string>('English');
  const [goals, setGoals] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<string>('Active');
  const [explanationDepth, setExplanationDepth] = useState<string>('Give me some context');

  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const profile = await getUserProfile();
        if (profile) {
          setFullProfile(profile);
          setLanguage(profile.language || 'English');
          setGoals(profile.goals || []);
          setActivityLevel(profile.activityLevel || 'Active');
          setExplanationDepth(profile.explanationDepth || 'Give me some context');
        }
      };
      loadData();
    }, [])
  );

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveUserProfile({
        ...fullProfile, // Keep name, macros, and onboarding flags intact
        language,
        goals,
        activityLevel,
        explanationDepth
      });
      Alert.alert("Success", "Your preferences have been updated!");
    } catch (error) {
      Alert.alert("Error", "Could not save your preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.subTitle}>PROFILE</Text>
          <Text style={styles.mainTitle}>Your preferences</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>LANGUAGE</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity 
              style={[styles.langButton, language === 'English' ? styles.langButtonActive : styles.langButtonInactive]}
              onPress={() => setLanguage('English')}
              activeOpacity={0.8}
            >
              <Text style={styles.langIcon}>🇬🇧</Text>
              <Text style={[styles.langText, language === 'English' && styles.textWhite]}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.langButton, language === 'Português' ? styles.langButtonActive : styles.langButtonInactive]}
              onPress={() => setLanguage('Português')}
              activeOpacity={0.8}
            >
              <Text style={styles.langIcon}>🇵🇹</Text>
              <Text style={[styles.langText, language === 'Português' && styles.textWhite]}>Português</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.accordionHeader, isGoalsExpanded && styles.accordionHeaderExpanded]} 
          onPress={() => setIsGoalsExpanded(!isGoalsExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.accordionTitleRow}>
            <Text style={styles.targetIcon}>🎯</Text>
            <Text style={styles.accordionTitle}>Edit My Goals</Text>
          </View>
        </TouchableOpacity>

        {isGoalsExpanded && (
          <View style={styles.accordionContent}>

            <Text style={styles.sectionLabelSmall}>MY GOALS</Text>
            <View style={styles.optionsList}>
              {[
                { id: 'Eat more balanced meals', icon: '🥗' },
                { id: 'Build muscle', icon: '💪' },
                { id: 'Lose body fat', icon: '⚖️' },
                { id: 'Feel fuller', icon: '🥣' },
                { id: 'Understand nutrition better', icon: '🧠' }
              ].map(item => {
                const isSelected = goals.includes(item.id);
                return (
                  <TouchableOpacity 
                    key={item.id}
                    style={[styles.optionCard, isSelected && styles.cardActive]}
                    onPress={() => toggleGoal(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                    <Text style={[styles.optionText, isSelected && styles.textWhite]}>{item.id}</Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabelSmall}>ACTIVITY LEVEL</Text>
            <View style={styles.optionsList}>
              {[
                { id: 'Mostly sedentary', icon: '🌱' },
                { id: 'Lightly active', icon: '🚶' },
                { id: 'Active', icon: '🏋️' },
                { id: 'Very active', icon: '🔥' },
                { id: 'Highly active', icon: '🏆' }
              ].map(item => {
                const isSelected = activityLevel === item.id;
                return (
                  <TouchableOpacity 
                    key={item.id}
                    style={[styles.optionCard, isSelected && styles.cardActive]}
                    onPress={() => setActivityLevel(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                    <Text style={[styles.optionText, isSelected && styles.textWhite]}>{item.id}</Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabelSmall}>EXPLANATION DEPTH</Text>
            <View style={styles.optionsList}>
              {[
                { id: 'Keep it simple', icon: '⚡' },
                { id: 'Give me some context', icon: '💬' },
                { id: 'Give me the hidden details', icon: '🔍' }
              ].map(item => {
                const isSelected = explanationDepth === item.id;
                return (
                  <TouchableOpacity 
                    key={item.id}
                    style={[styles.optionCard, isSelected && styles.cardActive]}
                    onPress={() => setExplanationDepth(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                    <Text style={[styles.optionText, isSelected && styles.textWhite]}>{item.id}</Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

          </View>
        )}

        {/* Spacing for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave} 
          disabled={isSaving}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save changes'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  scroll: { paddingHorizontal: 24, paddingTop: 20 },
  
  header: { marginBottom: 30 },
  subTitle: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  cardSection: { backgroundColor: '#F1F7EE', borderRadius: 20, padding: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#739561', marginBottom: 16, letterSpacing: 1 },
  
  languageRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  langButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  langButtonInactive: { backgroundColor: '#FFFFFF' },
  langButtonActive: { backgroundColor: '#2E5316' },
  langIcon: { fontSize: 20, marginRight: 8 },
  langText: { fontSize: 15, fontWeight: '700', color: '#1B3113' },
  
  accordionHeader: { backgroundColor: '#F1F7EE', borderRadius: 20, padding: 20, marginBottom: 20 },
  accordionHeaderExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 },
  accordionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  targetIcon: { fontSize: 24, marginRight: 12 },
  accordionTitle: { fontSize: 16, fontWeight: '800', color: '#1B3113' },
  
  accordionContent: { backgroundColor: '#FFFBF5', paddingVertical: 20 },
  sectionLabelSmall: { fontSize: 12, fontWeight: '800', color: '#739561', marginBottom: 12, letterSpacing: 1, marginTop: 10 },
  optionsList: { gap: 12, marginBottom: 24 },
  
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F7EE', borderRadius: 16, padding: 20 },
  cardActive: { backgroundColor: '#2E5316', borderColor: '#2E5316' },
  optionIcon: { fontSize: 24, marginRight: 16 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1B3113', flex: 1 },
  textWhite: { color: '#FFFFFF' },
  checkIcon: { color: '#FFF', fontSize: 14, fontWeight: '900' },

  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 10, backgroundColor: 'rgba(255, 251, 245, 0.9)' },
  saveButton: { backgroundColor: '#2E5316', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});