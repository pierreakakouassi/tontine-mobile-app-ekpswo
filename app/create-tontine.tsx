
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { CreateTontineData } from '../types';
import { formatCurrency } from '../data/mockData';
import Icon from '../components/Icon';

export default function CreateTontineScreen() {
  const [formData, setFormData] = useState<CreateTontineData>({
    name: '',
    description: '',
    memberCount: 5,
    contributionAmount: 10000,
    frequency: 'weekly',
    drawOrder: 'manual',
  });

  const handleInputChange = (field: keyof CreateTontineData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    console.log(`Updated ${field}:`, value);
  };

  const handleContinue = () => {
    console.log('Validating form data:', formData);
    
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour la tontine');
      return;
    }

    if (formData.memberCount < 2) {
      Alert.alert('Erreur', 'Une tontine doit avoir au moins 2 membres');
      return;
    }

    if (formData.contributionAmount < 1000) {
      Alert.alert('Erreur', 'Le montant de cotisation doit être d\'au moins 1,000 FCFA');
      return;
    }

    // Navigate to step 2 with form data
    router.push({
      pathname: '/create-tontine/step2-members',
      params: { tontineData: JSON.stringify(formData) }
    });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          paddingVertical: 20,
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.title}>Créer une tontine</Text>
            <Text style={commonStyles.textSecondary}>Étape 1 - Paramètres</Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 24, gap: 8 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }} />
        </View>

        {/* Form */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Nom du cercle *
          </Text>
          <TextInput
            style={commonStyles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Ex: Cercle des amis, Tontine bureau..."
            placeholderTextColor={colors.textSecondary}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginRight: 8 }]}>
              Devise:
            </Text>
            <View style={{
              backgroundColor: colors.primary + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}>
              <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
                FCFA (par défaut)
              </Text>
            </View>
          </View>

          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Description (optionnel)
          </Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Décrivez l'objectif de votre tontine..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Durée (nombre de tours = membres) *
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.border,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
              onPress={() => handleInputChange('memberCount', Math.max(2, formData.memberCount - 1))}
            >
              <Icon name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: '600', minWidth: 40, textAlign: 'center' }]}>
                {formData.memberCount}
              </Text>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                membres
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 16,
              }}
              onPress={() => handleInputChange('memberCount', Math.min(20, formData.memberCount + 1))}
            >
              <Icon name="add" size={20} color={colors.backgroundAlt} />
            </TouchableOpacity>
          </View>

          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Montant de cotisation (FCFA) *
          </Text>
          <TextInput
            style={commonStyles.input}
            value={formData.contributionAmount.toString()}
            onChangeText={(value) => handleInputChange('contributionAmount', parseInt(value) || 0)}
            placeholder="10000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />

          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Fréquence (hebdo/mensuelle) *
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                formData.frequency === 'weekly' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('frequency', 'weekly')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                formData.frequency === 'weekly' && { color: colors.backgroundAlt }
              ]}>
                Hebdomadaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                formData.frequency === 'monthly' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('frequency', 'monthly')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                formData.frequency === 'monthly' && { color: colors.backgroundAlt }
              ]}>
                Mensuelle
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
            Ordre de tirage *
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                formData.drawOrder === 'manual' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('drawOrder', 'manual')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                formData.drawOrder === 'manual' && { color: colors.backgroundAlt }
              ]}>
                Manuel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonStyles.buttonSecondary,
                { flex: 1 },
                formData.drawOrder === 'random' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleInputChange('drawOrder', 'random')}
            >
              <Text style={[
                commonStyles.buttonSecondaryText,
                formData.drawOrder === 'random' && { color: colors.backgroundAlt }
              ]}>
                Aléatoire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summary Card */}
          <View style={[commonStyles.card, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12, color: colors.primary }]}>
              Résumé
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={commonStyles.textSecondary}>Total par tour</Text>
                <Text style={commonStyles.text}>
                  {(formData.contributionAmount * formData.memberCount).toLocaleString()} FCFA
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={commonStyles.textSecondary}>Durée estimée</Text>
                <Text style={commonStyles.text}>
                  {formData.memberCount} {formData.frequency === 'weekly' ? 'semaines' : 'mois'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[commonStyles.button, { marginTop: 24 }]}
            onPress={handleContinue}
          >
            <Text style={commonStyles.buttonText}>Continuer - Ajouter des membres</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
