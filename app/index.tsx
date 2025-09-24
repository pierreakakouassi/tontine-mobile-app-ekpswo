
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { Circle, CircleMember, User } from '../types';
import Icon from '../components/Icon';

interface CircleWithMembers extends Circle {
  members: (CircleMember & { user: User })[];
  current_cycle?: {
    beneficiary_member_id: string;
    index: number;
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<CircleWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUserCircles();
  }, []);

  const loadUserCircles = async () => {
    try {
      console.log('Loading user circles...');
      
      // In development, use mock data
      if (__DEV__) {
        const mockCircles: CircleWithMembers[] = [
          {
            id: '1',
            owner_id: user?.id || '1',
            name: 'Tontine Famille',
            description: 'Tontine familiale mensuelle',
            currency: 'XOF',
            amount_per_round: 50000,
            frequency: 'monthly',
            status: 'active',
            created_at: new Date().toISOString(),
            members: [
              {
                id: '1',
                circle_id: '1',
                user_id: user?.id || '1',
                role: 'ADMIN',
                order_index: 1,
                joined_at: new Date().toISOString(),
                user: user || {
                  id: '1',
                  phone: '+225XXXXXXXX',
                  name: 'Vous',
                  reliability_score: 95,
                  lang: 'fr',
                  created_at: new Date().toISOString(),
                },
              },
              {
                id: '2',
                circle_id: '1',
                user_id: '2',
                role: 'MEMBER',
                order_index: 2,
                joined_at: new Date().toISOString(),
                user: {
                  id: '2',
                  phone: '+225YYYYYYYY',
                  name: 'Marie Kouassi',
                  reliability_score: 88,
                  lang: 'fr',
                  created_at: new Date().toISOString(),
                },
              },
            ],
            current_cycle: {
              beneficiary_member_id: '2',
              index: 1,
            },
          },
        ];
        
        setCircles(mockCircles);
        setIsLoading(false);
        return;
      }

      // In production, fetch from API
      const response = await apiService.getUserCircles();
      
      if (response.success && response.data) {
        // Fetch detailed info for each circle
        const circlesWithDetails = await Promise.all(
          response.data.map(async (circle) => {
            const detailResponse = await apiService.getCircleById(circle.id);
            if (detailResponse.success && detailResponse.data) {
              return detailResponse.data;
            }
            return { ...circle, members: [] };
          })
        );
        
        setCircles(circlesWithDetails);
      } else {
        console.error('Failed to load circles:', response.error);
        Alert.alert('Erreur', response.error || 'Impossible de charger vos tontines');
      }
    } catch (error) {
      console.error('Error loading circles:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserCircles();
  };

  const handleCreateCircle = () => {
    console.log('Navigate to create circle');
    router.push('/create-tontine');
  };

  const handleJoinCircle = () => {
    console.log('Navigate to join circle');
    Alert.prompt(
      'Rejoindre une tontine',
      'Saisissez le code d\'invitation:',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Rejoindre', 
          onPress: async (code) => {
            if (code && code.trim()) {
              try {
                // In development, just show success
                if (__DEV__) {
                  Alert.alert('Succès', `Demande envoyée pour rejoindre la tontine avec le code: ${code}`);
                  return;
                }
                
                // In production, attempt to join
                // Note: We need the circle ID, which we don't have from just the code
                // This would typically be handled by a separate endpoint that resolves the code
                Alert.alert('Info', 'Fonctionnalité en cours de développement');
              } catch (error) {
                Alert.alert('Erreur', 'Impossible de rejoindre la tontine');
              }
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleCirclePress = (circleId: string) => {
    console.log('Navigate to circle dashboard:', circleId);
    router.push(`/tontine/${circleId}`);
  };

  const handleProfilePress = () => {
    console.log('Navigate to profile');
    router.push('/profile');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return colors.success;
      case 'completed': return colors.primary;
      case 'paused': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Icon name="hourglass" size={48} color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: 16 }]}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingVertical: 20,
        }}>
          <View>
            <Text style={commonStyles.title}>
              Bonjour {user?.name?.split(' ')[0] || 'Utilisateur'} 👋
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={commonStyles.textSecondary}>Score de fiabilité: </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color={colors.warning} />
                <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 4, color: colors.warning }]}>
                  {user?.reliability_score || 0}%
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => router.push('/notifications')}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.backgroundAlt,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Icon name="notifications" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePress}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {user?.avatar_url ? (
                  <Icon name="person" size={24} color={colors.backgroundAlt} />
                ) : (
                  <Icon name="person" size={24} color={colors.backgroundAlt} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Actions rapides</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[commonStyles.button, { flex: 1 }]}
              onPress={handleCreateCircle}
            >
              <Icon name="add-circle" size={20} color={colors.backgroundAlt} style={{ marginBottom: 4 }} />
              <Text style={commonStyles.buttonText}>Créer une tontine</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[commonStyles.buttonSecondary, { flex: 1 }]}
              onPress={handleJoinCircle}
            >
              <Icon name="people" size={20} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={commonStyles.buttonSecondaryText}>Rejoindre via code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Circles */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Mes tontines ({circles.length})</Text>
          
          {circles.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="wallet" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: 8 }]}>
                Aucune tontine pour le moment
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                Créez votre première tontine ou rejoignez-en une existante
              </Text>
            </View>
          ) : (
            circles.map((circle) => {
              const totalMembers = circle.members.length;
              const currentBeneficiary = circle.current_cycle 
                ? circle.members.find(m => m.id === circle.current_cycle?.beneficiary_member_id)
                : null;
              
              return (
                <TouchableOpacity
                  key={circle.id}
                  style={commonStyles.card}
                  onPress={() => handleCirclePress(circle.id)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                        {circle.name}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {totalMembers} membres • {circle.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: getStatusColor(circle.status),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ color: colors.backgroundAlt, fontSize: 12, fontWeight: '500' }}>
                        {getStatusText(circle.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={commonStyles.textSecondary}>Cotisation par tour</Text>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      {formatCurrency(circle.amount_per_round)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={commonStyles.textSecondary}>Devise</Text>
                    <Text style={commonStyles.text}>
                      {circle.currency}
                    </Text>
                  </View>

                  {currentBeneficiary && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={commonStyles.textSecondary}>Prochain bénéficiaire</Text>
                      <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '500' }]}>
                        {currentBeneficiary.user.name}
                      </Text>
                    </View>
                  )}

                  {circle.description && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {circle.description}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
