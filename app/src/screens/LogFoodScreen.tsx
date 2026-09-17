import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Platform, 
  Button 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { analyzeFood } from '../api';
import { getUserProfile } from '../storage';

type RootStackParamList = {
  ProductOverview: {
    product: {
      name: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      ingredients: string[];
      aiAnalysis: string;
      isRecommended: boolean;
    };
  };
};

export default function LogFoodScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [ingredients, setIngredients] = useState('');

  const [unknownMacros, setUnknownMacros] = useState(false);
  const [isFromBarcode, setIsFromBarcode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualExpanded, setIsManualExpanded] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const resetForm = () => {
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setIngredients('');
    setUnknownMacros(false);
    setIsFromBarcode(false); 
    setError(null);
    setIsManualExpanded(false);
  };

  const fetchProductData = async (barcode: string) => {
    try {
      setLoading(true);
      setIsScanning(false); 
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const json = await response.json();

      if (json.status === 1 && json.product) {
        const p = json.product;
        setFoodName(p.product_name || p.generic_name || '');
        setCalories(String(p.nutriments?.['energy-kcal_100g'] || 0));
        setProtein(String(p.nutriments?.proteins_100g || 0));
        setCarbs(String(p.nutriments?.carbohydrates_100g || 0));
        setFat(String(p.nutriments?.fat_100g || 0));
        setIngredients(p.ingredients_text || '');

        setUnknownMacros(false);
        setIsFromBarcode(true);
        setIsManualExpanded(false);
        setError(null);
      } else {
        setError('Product not found in database. Please enter manually.');
      }
    } catch (err) {
      setError('Failed to fetch product data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!foodName && unknownMacros) {
      setError("Please enter a food name to search.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile();

      const scannedData = {
        name: foodName,
        calories: unknownMacros ? 0 : (parseInt(calories, 10) || 0),
        protein_g: unknownMacros ? 0 : (parseInt(protein, 10) || 0),
        carbs_g: unknownMacros ? 0 : (parseInt(carbs, 10) || 0),
        fat_g: unknownMacros ? 0 : (parseInt(fat, 10) || 0),
        ingredients: unknownMacros
          ? [foodName]
          : ingredients.split(',').map((item) => item.trim()).filter(Boolean),
        userProfile: userProfile,
      };

      // @ts-ignore
      const data = await analyzeFood(scannedData);

      const finalName = foodName.trim() || 'Unnamed Food';
      const finalCalories = unknownMacros ? data.calories : (parseInt(calories, 10) || data.calories || 0);
      const finalProtein = unknownMacros ? data.protein_g : (parseInt(protein, 10) || data.protein_g || 0);
      const finalCarbs = unknownMacros ? data.carbs_g : (parseInt(carbs, 10) || data.carbs_g || 0);
      const finalFat = unknownMacros ? data.fat_g : (parseInt(fat, 10) || data.fat_g || 0);
      const finalIngredients = unknownMacros ? [finalName] : ingredients.split(',').map((item) => item.trim()).filter(Boolean);

      resetForm();
      setIsManualExpanded(false);

      navigation.navigate('ProductOverview', {
        product: {
          name: finalName,
          calories: finalCalories,
          protein_g: finalProtein,
          carbs_g: finalCarbs,
          fat_g: finalFat,
          ingredients: finalIngredients,
          aiAnalysis: data.sugar_translation,
          isRecommended: data.isRecommended,
        }
      });
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setLoading(false);
    }
  };

  
  if (isScanning) {
    if (!permission?.granted) {
      return (
        <View style={styles.cameraContainer}>
          <Text style={styles.cameraText}>Permission needed for camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" />
          <Button onPress={() => setIsScanning(false)} title="Cancel" color="red" />
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }} 
          onBarcodeScanned={({ data }) => fetchProductData(data)} 
        />
        <View style={styles.cameraOverlay}>
          <Button title="Cancel Scan" onPress={() => setIsScanning(false)} color="#fff" />
        </View>
      </View>
    );
  }

  const MacroCard = ({ title, color, unit, value, onChange }: any) => (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.macroTitle}>{title}</Text>
      </View>
      <View style={styles.macroInputRow}>
        <TextInput 
          style={styles.macroInput} 
          keyboardType="numeric" 
          value={value} 
          onChangeText={onChange} 
          placeholder="0" 
          placeholderTextColor="#A0B298" 
        />
        <View style={styles.unitContainer}>
          <View style={styles.arrowsContainer}>
            <Text style={styles.arrowIcon}>▴</Text>
            <Text style={styles.arrowIcon}>▾</Text>
          </View>
          <Text style={styles.macroUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.subTitle}>LOG FOOD</Text>
          <Text style={styles.mainTitle}>What did you eat?</Text>
        </View>

        {isFromBarcode ? (
          <View style={styles.scannedContainer}>
            <View style={styles.scannedHeaderRow}>
              <Text style={styles.macroTitle}>SCANNED PRODUCT</Text>
              <TouchableOpacity onPress={resetForm} activeOpacity={0.7}>
                <Text style={styles.discardText}>✕ Discard</Text>
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.textInputFull} 
              value={foodName} 
              onChangeText={setFoodName} 
              placeholder="Product Name" 
              placeholderTextColor="#A0B298"
            />

            <View style={[styles.grid, { marginTop: 16 }]}>
              <MacroCard title="CALORIES" color="#F08C36" unit="kcal" value={calories} onChange={setCalories} />
              <MacroCard title="PROTEIN" color="#2E5316" unit="g" value={protein} onChange={setProtein} />
              <MacroCard title="CARBS" color="#E8B83A" unit="g" value={carbs} onChange={setCarbs} />
              <MacroCard title="FAT" color="#DB544B" unit="g" value={fat} onChange={setFat} />
            </View>

            <View style={styles.ingredientsSection}>
              <Text style={styles.macroTitle}>INGREDIENTS</Text>
              <TextInput 
                style={[styles.textInputFull, { marginTop: 12 }]} 
                value={ingredients} 
                onChangeText={setIngredients} 
                placeholder="No ingredients found" 
                placeholderTextColor="#A0B298"
              />
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.scanButton} onPress={() => setIsScanning(true)} activeOpacity={0.85}>
              <Text style={styles.scanButtonText}>📷 Scan barcode</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualToggleButton} onPress={() => setIsManualExpanded(!isManualExpanded)} activeOpacity={0.7}>
              <Text style={styles.manualToggleText}>✏️ Enter manually  <Text style={styles.toggleArrow}>{isManualExpanded ? '▲' : '▼'}</Text></Text>
            </TouchableOpacity>

            {isManualExpanded && (
              <View>
                <View style={styles.ingredientsSection}>
                  <Text style={styles.macroTitle}>FOOD NAME</Text>
                  <TextInput 
                    style={styles.textInputFull} 
                    value={foodName} 
                    onChangeText={setFoodName} 
                    placeholder="e.g. Greek Yogurt, Apple" 
                    placeholderTextColor="#A0B298"
                  />
                  
                  <TouchableOpacity 
                    style={styles.checkboxRow} 
                    onPress={() => setUnknownMacros(!unknownMacros)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, unknownMacros && styles.checkboxActive]}>
                      {unknownMacros && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <Text style={styles.checkboxLabel}>I don't know the macros</Text>
                  </TouchableOpacity>
                </View>

                {!unknownMacros && (
                  <>
                    <View style={styles.grid}>
                      <MacroCard title="CALORIES" color="#F08C36" unit="kcal" value={calories} onChange={setCalories} />
                      <MacroCard title="PROTEIN" color="#2E5316" unit="g" value={protein} onChange={setProtein} />
                      <MacroCard title="CARBS" color="#E8B83A" unit="g" value={carbs} onChange={setCarbs} />
                      <MacroCard title="FAT" color="#DB544B" unit="g" value={fat} onChange={setFat} />
                    </View>

                    <View style={styles.ingredientsSection}>
                      <Text style={styles.macroTitle}>INGREDIENTS</Text>
                      <TextInput 
                        style={[styles.textInputFull, { marginTop: 12 }]} 
                        value={ingredients} 
                        onChangeText={setIngredients} 
                        placeholder="e.g. Brown rice, 150g" 
                        placeholderTextColor="#A0B298"
                      />
                    </View>
                  </>
                )}

                <TouchableOpacity style={styles.resetButton} onPress={resetForm} activeOpacity={0.7}>
                  <Text style={styles.resetButtonText}>↻ Clear Fields</Text>
                </TouchableOpacity>

              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.exploreButton} onPress={handleAnalyze} disabled={loading} activeOpacity={0.9}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exploreButtonText}>
              {unknownMacros ? 'Search & Explore 🔍' : 'Explore a food'}
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  subTitle: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 4, letterSpacing: 1 },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  scanButton: { backgroundColor: '#2E5316', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  scanButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  manualToggleButton: { backgroundColor: '#F8FCF5', borderWidth: 1, borderColor: '#DDF0CF', paddingVertical: 14, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  manualToggleText: { color: '#4B7B2E', fontSize: 14, fontWeight: '700' },
  toggleArrow: { color: '#A0B298', fontSize: 10 },
  
  scannedContainer: { marginBottom: 10 },
  scannedHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  discardText: { color: '#DB544B', fontSize: 13, fontWeight: '700' },

  textInputFull: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDF0CF', borderRadius: 12, padding: 14, fontSize: 15, color: '#1B3113', marginTop: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#DDF0CF', alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#FFF' },
  checkboxActive: { backgroundColor: '#2E5316', borderColor: '#2E5316' },
  checkboxLabel: { fontSize: 14, color: '#4B7B2E', fontWeight: '700' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  macroCard: { width: '48%', backgroundColor: '#F1F7EE', borderRadius: 16, padding: 16, marginBottom: 16 },
  macroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  macroTitle: { fontSize: 12, fontWeight: '700', color: '#4B7B2E', letterSpacing: 0.5 },
  macroInputRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  macroInput: { fontSize: 32, fontWeight: '700', color: '#607952', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', padding: 0, flex: 1 },
  unitContainer: { flexDirection: 'row', alignItems: 'center' },
  arrowsContainer: { marginRight: 4, justifyContent: 'center', backgroundColor: '#E4ECE0', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  arrowIcon: { fontSize: 8, color: '#607952', lineHeight: 8 },
  macroUnit: { fontSize: 12, fontWeight: '700', color: '#A0B298' },
  ingredientsSection: { backgroundColor: '#F1F7EE', borderRadius: 16, padding: 16, marginBottom: 10 },
  
  resetButton: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  resetButtonText: { color: '#A0B298', fontSize: 14, fontWeight: '700' },

  exploreButton: { backgroundColor: '#EF7E22', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginTop: 10, shadowColor: '#EF7E22', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  exploreButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  errorBox: { marginTop: 10, padding: 16, backgroundColor: '#FDF3F2', borderWidth: 1, borderColor: '#FAD5D2', borderRadius: 16, marginBottom: 20 },
  errorText: { color: '#DB544B', textAlign: 'center', fontWeight: '700', fontSize: 14 },
  
  cameraContainer: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  cameraText: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  cameraOverlay: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }
});