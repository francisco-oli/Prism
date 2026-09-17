import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { saveUserProfile } from '../storage';

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [language, setLanguage] = useState<string | null>(null);
  const [name, setName] = useState(''); 
  const [goals, setGoals] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [explanationDepth, setExplanationDepth] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 4) { 
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await saveUserProfile({
        name: name.trim() || 'User', 
        language: language || 'English',
        goals: goals,
        activityLevel: activityLevel || 'Active',
        explanationDepth: explanationDepth || 'Give me some context',
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyCarbs: 200,
        dailyFat: 65,
        hasOnboarded: true,
      });
      // Move to the final "Nice to meet you" screen instead of closing immediately
      setCurrentStep(5); 
    } catch (err) {
      console.error('Error saving onboarding data', err);
    }
  };

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressDot, currentStep >= 1 && currentStep < 5 ? styles.progressActive : null]} />
      <View style={[styles.progressDot, currentStep >= 2 && currentStep < 5 ? styles.progressActive : null]} />
      <View style={[styles.progressDot, currentStep >= 3 && currentStep < 5 ? styles.progressActive : null]} />
      <View style={[styles.progressDot, currentStep >= 4 && currentStep < 5 ? styles.progressActive : null]} />
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.logoIcon}>🌿</Text>
        <Text style={styles.welcomeTitle}>Welcome to Prism</Text>
        <Text style={styles.welcomeSubtitle}>
          Your personal guide to eating well, feeling great, and understanding food.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>CHOOSE YOUR LANGUAGE</Text>
      
      {/* We reduce the bottom margin here so the note fits nicely below it */}
      <View style={[styles.languageRow, language === 'Português' ? { marginBottom: 16 } : {}]}>
        <TouchableOpacity 
          style={[styles.languageCard, language === 'English' && styles.cardActive]}
          onPress={() => setLanguage('English')}
          activeOpacity={0.8}
        >
          <Text style={styles.flagIcon}>🇬🇧</Text>
          <Text style={[styles.cardTitle, language === 'English' && styles.textWhite]}>English</Text>
          {language === 'English' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.languageCard, language === 'Português' && styles.cardActive]}
          onPress={() => setLanguage('Português')}
          activeOpacity={0.8}
        >
          <Text style={styles.flagIcon}>🇵🇹</Text>
          <Text style={[styles.cardTitle, language === 'Português' && styles.textWhite]}>Português</Text>
          {language === 'Português' && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>

      {language === 'Português' && (
        <View style={styles.portugueseNoticeBox}>
          <Text style={styles.portugueseNoticeText}>
            Nesta versão antecipada, o Português está disponível apenas nas informações dos produtos. A tradução completa do menu estará disponível em breve.
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.nextButton, !language && styles.buttonDisabled]} 
        onPress={handleNext} 
        disabled={!language}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {renderProgressBar()}
      <Text style={styles.stepIndicator}>STEP 1 OF 4</Text>
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>Your preferred name or nickname.</Text>

      <TextInput 
        style={styles.textInputFull} 
        value={name} 
        onChangeText={setName} 
        placeholder="e.g. Alex" 
        placeholderTextColor="#A0B298"
        autoFocus
      />

      <TouchableOpacity 
        style={[styles.nextButton, !name.trim() && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={!name.trim()}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      {renderProgressBar()}
      <Text style={styles.stepIndicator}>STEP 2 OF 4</Text>
      <Text style={styles.stepTitle}>What are you hoping food can help you with?</Text>
      <Text style={styles.stepSubtitle}>Pick one or more.</Text>

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
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, goals.length === 0 && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={goals.length === 0}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      {renderProgressBar()}
      <Text style={styles.stepIndicator}>STEP 3 OF 4</Text>
      <Text style={styles.stepTitle}>How active are you on a typical week?</Text>

      <View style={styles.optionsList}>
        {[
          { id: 'Mostly sedentary', icon: '🌱', desc: 'Mostly sitting, little intentional exercise.' },
          { id: 'Lightly active', icon: '🚶', desc: 'I walk regularly and/or exercise occasionally.' },
          { id: 'Active', icon: '🏋️', desc: 'I exercise several times a week.' },
          { id: 'Very active', icon: '🔥', desc: 'I train frequently or have a physically demanding lifestyle.' },
          { id: 'Highly active', icon: '🏆', desc: 'Training/performance is a major part of my life.' }
        ].map(item => {
          const isSelected = activityLevel === item.id;
          return (
            <TouchableOpacity 
              key={item.id}
              style={[styles.optionCardTall, isSelected && styles.cardActive]}
              onPress={() => setActivityLevel(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionText, isSelected && styles.textWhite]}>{item.id}</Text>
                <Text style={[styles.optionDesc, isSelected && styles.textWhiteMedium]}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, !activityLevel && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={!activityLevel}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      {renderProgressBar()}
      <Text style={styles.stepIndicator}>STEP 4 OF 4</Text>
      <Text style={styles.stepTitle}>How do you want us to explain things?</Text>
      <Text style={styles.stepSubtitle}>We'll adjust how deep we go on each topic.</Text>

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
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, !explanationDepth && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={!explanationDepth}
      >
        <Text style={styles.nextButtonText}>Complete Setup</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center', marginTop: 60 }]}>
      <Text style={styles.logoIcon}>👋</Text>
      <Text style={styles.welcomeTitle}>Nice to meet you,</Text>
      <Text style={[styles.welcomeTitle, { color: '#508933' }]}>{name.trim() || 'User'}!</Text>
      <Text style={[styles.welcomeSubtitle, { marginTop: 16 }]}>
        Your profile is perfectly set up. Let's get to your dashboard.
      </Text>

      <TouchableOpacity 
        style={[styles.nextButton, { width: '100%', marginTop: 60 }]} 
        onPress={onComplete}
      >
        <Text style={styles.nextButtonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {currentStep === 0 && renderWelcome()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()} 
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFBF5' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20, flexGrow: 1 },
  stepContainer: { flex: 1 },

  progressContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 6 },
  progressDot: { width: 12, height: 6, borderRadius: 3, backgroundColor: '#DDF0CF' },
  progressActive: { width: 24, backgroundColor: '#2E5316' },

  welcomeHeader: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  logoIcon: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: { fontSize: 36, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', textAlign: 'center', marginBottom: 12 },
  welcomeSubtitle: { fontSize: 16, color: '#607952', textAlign: 'center', lineHeight: 24, fontWeight: '500', paddingHorizontal: 20 },
  
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#A0B298', textAlign: 'center', letterSpacing: 1.5, marginBottom: 20 },
  
  stepIndicator: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  stepTitle: { fontSize: 32, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 8, lineHeight: 38 },
  stepSubtitle: { fontSize: 15, color: '#A0B298', fontWeight: '500', marginBottom: 24 },

  languageRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 40 },
  optionsList: { gap: 12, marginBottom: 40 },

  textInputFull: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDF0CF', borderRadius: 16, padding: 20, fontSize: 18, color: '#1B3113', fontWeight: '600', marginTop: 10 },
  languageCard: { flex: 1, backgroundColor: '#F1F7EE', borderRadius: 20, padding: 24, alignItems: 'center', minHeight: 140, justifyContent: 'center' },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F7EE', borderRadius: 16, padding: 20 },
  optionCardTall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F7EE', borderRadius: 16, padding: 20, minHeight: 80 },
  
  cardActive: { backgroundColor: '#2E5316' },
  
  flagIcon: { fontSize: 32, marginBottom: 12 },
  optionIcon: { fontSize: 24, marginRight: 16 },
  
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1B3113' },
  optionTextContainer: { flex: 1 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#1B3113' },
  optionDesc: { fontSize: 13, color: '#A0B298', fontWeight: '500', marginTop: 4 },
  
  textWhite: { color: '#FFFFFF' },
  textWhiteMedium: { color: 'rgba(255,255,255,0.8)' },
  checkmark: { color: '#FFF', fontSize: 12, marginTop: 8 },

  nextButton: { backgroundColor: '#1B3113', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#DDF0CF' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  portugueseNoticeBox: {
    backgroundColor: '#F1F7EE',
    borderWidth: 1,
    borderColor: '#DDF0CF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  portugueseNoticeText: {
    color: '#4B7B2E',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});