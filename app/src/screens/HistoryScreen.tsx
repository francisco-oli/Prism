import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Platform, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import { getFoodHistory, deleteFoodEntry, FoodEntry } from '../storage';

type RootStackParamList = {
  FoodDetail: { food: FoodEntry };
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<FoodEntry[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const savedFoods = await getFoodHistory();
        
        savedFoods.sort((a, b) => {
          const nameA = a.name || 'Unnamed Food';
          const nameB = b.name || 'Unnamed Food';
          return nameA.localeCompare(nameB);
        });
        
        setHistory(savedFoods);
      };
      loadHistory();
    }, [])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Forget Food ?",
      `Are you sure you want to remove "${name}" from your history?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive", // Renders as a red/destructive action on iOS
          onPress: async () => {
            await deleteFoodEntry(id);
            setHistory(prev => prev.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: FoodEntry }) => {
    const dateSubtitle = new Date(item.date).toLocaleDateString(undefined, { 
      month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate('FoodDetail', { food: item })}
        onLongPress={() => handleDelete(item.id, item.name || 'Unnamed Food')}
      >
        <View style={[styles.card, item.isRecommended ? styles.cardSuccess : styles.cardDanger]}>
          
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.foodNameText} numberOfLines={1}>
                {item.name || 'Unnamed Food'}
              </Text>
              <Text style={styles.dateSubtitle}>{dateSubtitle}</Text>
            </View>

            <View style={[styles.badge, item.isRecommended ? styles.badgeSuccess : styles.badgeDanger]}>
              <Text style={[styles.badgeText, item.isRecommended ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
                {item.isRecommended ? 'Recommended' : 'Not Recommended'}
              </Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}><Text style={styles.macroValue}>{item.calories}</Text><Text style={styles.macroLabel}>kcal</Text></View>
            <View style={styles.macroItem}><Text style={styles.macroValue}>{item.protein_g}g</Text><Text style={styles.macroLabel}>Protein</Text></View>
            <View style={styles.macroItem}><Text style={styles.macroValue}>{item.carbs_g}g</Text><Text style={styles.macroLabel}>Carbs</Text></View>
            <View style={styles.macroItem}><Text style={styles.macroValue}>{item.fat_g}g</Text><Text style={styles.macroLabel}>Fat</Text></View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.subTitle}>YOUR FOODS</Text>
        <Text style={styles.mainTitle}>History</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't saved any foods yet.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  subTitle: { fontSize: 12, fontWeight: '800', color: '#508933', marginBottom: 4, letterSpacing: 1 },
  mainTitle: { fontSize: 34, fontWeight: '900', color: '#1B3113', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  listContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 },
  
  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 16, backgroundColor: '#FFFFFF' },
  cardSuccess: { borderColor: '#DDF0CF' },
  cardDanger: { borderColor: '#FAD5D2' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleContainer: { flex: 1, paddingRight: 10 },
  foodNameText: { fontSize: 18, fontWeight: '800', color: '#1B3113', marginBottom: 4 },
  dateSubtitle: { fontSize: 12, color: '#A0B298', fontWeight: '600' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 2 },
  badgeSuccess: { backgroundColor: '#F1F7EE' },
  badgeDanger: { backgroundColor: '#FDF3F2' },
  badgeText: { fontSize: 12, fontWeight: '800' },
  badgeTextSuccess: { color: '#2E5316' },
  badgeTextDanger: { color: '#DB544B' },
  
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '800', color: '#4B7B2E' },
  macroLabel: { fontSize: 12, fontWeight: '600', color: '#A0B298', marginTop: 2 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: '#A0B298', textAlign: 'center', fontWeight: '500', lineHeight: 24 }
});