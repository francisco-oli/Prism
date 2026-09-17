import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveFoodEntry } from '../storage';

export default function ProductOverviewScreen({ route }: any) {
  const { product } = route.params;

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveFood = async () => {
    setIsSaving(true);
    try {
      await saveFoodEntry({
        name: product.name,
        calories: product.calories,
        protein_g: product.protein_g,
        carbs_g: product.carbs_g,
        fat_g: product.fat_g,
        ingredients: product.ingredients,
        aiAnalysis: product.aiAnalysis,
        isRecommended: product.isRecommended,
      });
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save to device storage:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.subTitle}>PRODUCT OVERVIEW</Text>
          <Text style={styles.mainTitle}>{product.name}</Text>
        </View>

        <View style={[styles.card, product.isRecommended ? styles.badgeSuccess : styles.badgeDanger]}>
          <Text style={[styles.badgeText, product.isRecommended ? styles.successText : styles.dangerText]}>
            {product.isRecommended ? 'Recommended' : 'Not Recommended'}
          </Text>
          <Text style={styles.analysisText}>{product.aiAnalysis}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <View style={[styles.dot, { backgroundColor: '#F08C36' }]} />
              <Text style={styles.macroTitle}>CALORIES</Text>
            </View>
            <Text style={styles.macroValue}>{product.calories} <Text style={styles.macroUnit}>kcal</Text></Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <View style={[styles.dot, { backgroundColor: '#2E5316' }]} />
              <Text style={styles.macroTitle}>PROTEIN</Text>
            </View>
            <Text style={styles.macroValue}>{product.protein_g} <Text style={styles.macroUnit}>g</Text></Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <View style={[styles.dot, { backgroundColor: '#E8B83A' }]} />
              <Text style={styles.macroTitle}>CARBS</Text>
            </View>
            <Text style={styles.macroValue}>{product.carbs_g} <Text style={styles.macroUnit}>g</Text></Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <View style={[styles.dot, { backgroundColor: '#DB544B' }]} />
              <Text style={styles.macroTitle}>FAT</Text>
            </View>
            <Text style={styles.macroValue}>{product.fat_g} <Text style={styles.macroUnit}>g</Text></Text>
          </View>
        </View>

        {product.ingredients && product.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>INGREDIENTS</Text>
            <Text style={styles.ingredientsText}>{product.ingredients.join(', ')}</Text>
          </View>
        )}


        <TouchableOpacity
          style={[styles.saveDeviceButton, isSaved && styles.saveDeviceButtonSuccess]} 
          onPress={handleSaveFood} 
          disabled={isSaving || isSaved}
          activeOpacity={0.9}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveDeviceButtonText}>
              {isSaved ? 'Saved to my foods! ✓' : 'Save to my foods 📥'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
  header: { marginBottom: 24 },
  subTitle: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 4, letterSpacing: 1 },
  mainTitle: { fontSize: 30, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  macroCard: { width: '48%', backgroundColor: '#F1F7EE', borderRadius: 16, padding: 16, marginBottom: 16 },
  macroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  macroTitle: { fontSize: 12, fontWeight: '700', color: '#4B7B2E', letterSpacing: 0.5 },
  macroValue: { fontSize: 28, fontWeight: '700', color: '#607952', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  macroUnit: { fontSize: 14, fontWeight: '700', color: '#A0B298', fontFamily: 'System' },
  ingredientsSection: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4ECE0', borderRadius: 16, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 10, letterSpacing: 1 },
  ingredientsText: { fontSize: 15, color: '#1B3113', lineHeight: 22, fontWeight: '500' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 24 },
  badgeSuccess: { backgroundColor: '#F1F7EE', borderColor: '#DDF0CF' },
  badgeDanger: { backgroundColor: '#FDF3F2', borderColor: '#FAD5D2' },
  badgeText: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '900', fontSize: 24, marginBottom: 12, letterSpacing: -0.5 },
  successText: { color: '#2E5316' },
  dangerText: { color: '#DB544B' },
  analysisText: { fontSize: 16, color: '#1B3113', lineHeight: 24, fontWeight: '500' },
  saveDeviceButton: { backgroundColor: '#2E5316', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  saveDeviceButtonSuccess: { backgroundColor: '#508933' },
  saveDeviceButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});