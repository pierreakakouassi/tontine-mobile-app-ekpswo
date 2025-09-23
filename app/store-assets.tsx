
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, Image } from 'react-native';
import Icon from '../components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';

interface AssetRequirement {
  id: string;
  title: string;
  description: string;
  platform: 'ios' | 'android' | 'both';
  size: string;
  format: string;
  required: boolean;
  example?: string;
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  assetItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  platformText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  assetDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  assetSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specItem: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specText: {
    fontSize: 12,
    color: colors.text,
  },
  requiredBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 8,
  },
  requiredText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  tipBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  exampleImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
  },
};

export default function StoreAssetsScreen() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ios' | 'android'>('all');

  const assetRequirements: AssetRequirement[] = [
    // Icônes principales
    {
      id: 'app-icon',
      title: 'Icône Application',
      description: 'Icône principale de l\'application pour les stores',
      platform: 'both',
      size: '1024x1024px',
      format: 'PNG (sans transparence)',
      required: true,
    },
    {
      id: 'adaptive-icon-android',
      title: 'Icône Adaptive Android',
      description: 'Icône adaptative pour Android (foreground + background)',
      platform: 'android',
      size: '432x432px',
      format: 'PNG',
      required: true,
    },
    {
      id: 'notification-icon',
      title: 'Icône Notification',
      description: 'Icône pour les notifications push',
      platform: 'both',
      size: '256x256px',
      format: 'PNG',
      required: false,
    },
    
    // Screenshots iOS
    {
      id: 'screenshot-iphone-67',
      title: 'Screenshots iPhone 6.7"',
      description: 'Captures d\'écran pour iPhone 14 Pro Max, 15 Pro Max',
      platform: 'ios',
      size: '1290x2796px',
      format: 'PNG ou JPG',
      required: true,
    },
    {
      id: 'screenshot-iphone-65',
      title: 'Screenshots iPhone 6.5"',
      description: 'Captures d\'écran pour iPhone 14 Plus, 15 Plus',
      platform: 'ios',
      size: '1242x2688px',
      format: 'PNG ou JPG',
      required: true,
    },
    {
      id: 'screenshot-iphone-55',
      title: 'Screenshots iPhone 5.5"',
      description: 'Captures d\'écran pour iPhone 8 Plus',
      platform: 'ios',
      size: '1242x2208px',
      format: 'PNG ou JPG',
      required: true,
    },
    {
      id: 'screenshot-ipad',
      title: 'Screenshots iPad',
      description: 'Captures d\'écran pour iPad Pro 12.9"',
      platform: 'ios',
      size: '2048x2732px',
      format: 'PNG ou JPG',
      required: false,
    },
    
    // Screenshots Android
    {
      id: 'screenshot-android-phone',
      title: 'Screenshots Android Phone',
      description: 'Captures d\'écran pour téléphones Android',
      platform: 'android',
      size: '1080x1920px',
      format: 'PNG ou JPG',
      required: true,
    },
    {
      id: 'screenshot-android-tablet',
      title: 'Screenshots Android Tablet',
      description: 'Captures d\'écran pour tablettes Android',
      platform: 'android',
      size: '1200x1920px',
      format: 'PNG ou JPG',
      required: false,
    },
    
    // Assets supplémentaires
    {
      id: 'splash-screen',
      title: 'Écran de Démarrage',
      description: 'Image affichée au lancement de l\'app',
      platform: 'both',
      size: '1242x2436px',
      format: 'PNG',
      required: false,
    },
    {
      id: 'favicon',
      title: 'Favicon Web',
      description: 'Icône pour la version web',
      platform: 'both',
      size: '32x32px',
      format: 'PNG ou ICO',
      required: false,
    },
  ];

  const filteredAssets = assetRequirements.filter(asset => 
    selectedPlatform === 'all' || asset.platform === selectedPlatform || asset.platform === 'both'
  );

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ios': return '#007AFF';
      case 'android': return '#4CAF50';
      default: return colors.primary;
    }
  };

  const getPlatformText = (platform: string) => {
    switch (platform) {
      case 'ios': return 'iOS';
      case 'android': return 'Android';
      default: return 'Tous';
    }
  };

  const showDesignTips = () => {
    Alert.alert(
      'Conseils de Design',
      '• Utilisez des couleurs vives et contrastées\n• Évitez le texte dans les icônes\n• Testez sur fond clair et sombre\n• Gardez un design simple et reconnaissable\n• Respectez les guidelines Apple/Google',
      [{ text: 'OK' }]
    );
  };

  const showScreenshotTips = () => {
    Alert.alert(
      'Conseils Screenshots',
      '• Montrez les fonctionnalités principales\n• Utilisez des données réalistes\n• Évitez les informations personnelles\n• Ajoutez des annotations si nécessaire\n• Testez sur différents appareils',
      [{ text: 'OK' }]
    );
  };

  const openAssetGenerator = () => {
    Linking.openURL('https://www.appicon.co/');
  };

  const openScreenshotTool = () => {
    Linking.openURL('https://screenshots.pro/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Assets App Store</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 Conseil Important</Text>
          <Text style={styles.tipText}>
            Préparez tous vos assets avant de soumettre aux stores. 
            Les icônes et screenshots sont obligatoires pour la publication.
          </Text>
        </View>

        {/* Filtres de plateforme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plateforme</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['all', 'ios', 'android'].map((platform) => (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.platformBadge,
                  {
                    backgroundColor: selectedPlatform === platform 
                      ? colors.primary 
                      : colors.border
                  }
                ]}
                onPress={() => setSelectedPlatform(platform as any)}
              >
                <Text style={[
                  styles.platformText,
                  {
                    color: selectedPlatform === platform 
                      ? colors.white 
                      : colors.text
                  }
                ]}>
                  {platform === 'all' ? 'Tous' : platform.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Liste des assets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets Requis</Text>
          
          {filteredAssets.map((asset) => (
            <View key={asset.id} style={styles.assetItem}>
              <View style={styles.assetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.assetTitle}>{asset.title}</Text>
                  {asset.required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>REQUIS</Text>
                    </View>
                  )}
                </View>
                <View style={[
                  styles.platformBadge,
                  { backgroundColor: getPlatformColor(asset.platform) }
                ]}>
                  <Text style={styles.platformText}>
                    {getPlatformText(asset.platform)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.assetDescription}>{asset.description}</Text>
              
              <View style={styles.assetSpecs}>
                <View style={styles.specItem}>
                  <Text style={styles.specText}>📐 {asset.size}</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specText}>🎨 {asset.format}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Outils recommandés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outils Recommandés</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openAssetGenerator}
          >
            <Text style={styles.actionButtonText}>
              🎨 Générateur d'Icônes (AppIcon.co)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openScreenshotTool}
          >
            <Text style={styles.actionButtonText}>
              📱 Outil Screenshots (Screenshots.pro)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={showDesignTips}
          >
            <Text style={styles.actionButtonText}>
              💡 Conseils de Design
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={showScreenshotTips}
          >
            <Text style={styles.actionButtonText}>
              📸 Conseils Screenshots
            </Text>
          </TouchableOpacity>
        </View>

        {/* Checklist finale */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist Finale</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              ✅ Icône 1024x1024px créée{'\n'}
              ✅ Screenshots iOS préparés (3 tailles){'\n'}
              ✅ Screenshots Android préparés{'\n'}
              ✅ Icône adaptive Android créée{'\n'}
              ✅ Tous les assets testés et validés{'\n'}
              ✅ Respect des guidelines Apple/Google
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
