
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';

const faqData = [
  {
    question: "Qu'est-ce qu'une tontine ?",
    answer: "Une tontine est un système d'épargne collective où chaque membre cotise régulièrement et reçoit à tour de rôle la totalité des cotisations."
  },
  {
    question: "Comment créer une tontine ?",
    answer: "Appuyez sur 'Créer' depuis l'accueil, définissez les paramètres (nombre de membres, montant, fréquence) et invitez vos proches."
  },
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer: "Nous acceptons Orange Money, MTN Mobile Money et Wave pour des paiements sécurisés et instantanés."
  },
  {
    question: "Que se passe-t-il si quelqu'un ne paie pas ?",
    answer: "Des rappels automatiques sont envoyés. En cas de retard persistant, des frais peuvent s'appliquer selon les règles du groupe."
  },
  {
    question: "Comment rejoindre une tontine existante ?",
    answer: "Demandez le code d'invitation au créateur de la tontine, puis utilisez 'Rejoindre' depuis l'accueil."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui, toutes les transactions sont chiffrées et nous respectons les standards de sécurité bancaire."
  },
];

export default function HelpScreen() {
  const [expandedItems, setExpandedItems] = React.useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
          <Text style={commonStyles.title}>Aide & FAQ</Text>
        </View>

        {/* Quick Actions */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Besoin d&apos;aide ?
          </Text>
          
          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => console.log('Contact support')}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="chatbubbles" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Contacter le support
              </Text>
              <Text style={commonStyles.textSecondary}>
                WhatsApp, téléphone ou email
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            onPress={() => console.log('Video tutorials')}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.success + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Icon name="play-circle" size={24} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Tutoriels vidéo
              </Text>
              <Text style={commonStyles.textSecondary}>
                Apprenez à utiliser l&apos;app
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={commonStyles.section}>
          <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
            Questions fréquentes
          </Text>
          
          {faqData.map((item, index) => {
            const isExpanded = expandedItems.includes(index);
            
            return (
              <TouchableOpacity
                key={index}
                style={[commonStyles.card, { marginBottom: 12 }]}
                onPress={() => toggleExpanded(index)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', flex: 1, marginRight: 16 }]}>
                    {item.question}
                  </Text>
                  <Icon 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </View>
                
                {isExpanded && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={commonStyles.textSecondary}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contact Info */}
        <View style={[commonStyles.card, { marginBottom: 24, backgroundColor: colors.background }]}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
            Nous contacter
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="call" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={commonStyles.textSecondary}>+225 07 00 00 00 00</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="mail" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={commonStyles.textSecondary}>support@tontineapp.ci</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="logo-whatsapp" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={commonStyles.textSecondary}>WhatsApp: +225 07 00 00 00 00</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing for navigation */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
