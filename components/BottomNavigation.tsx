
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: 'home', route: '/' },
  { id: 'create', label: 'Créer', icon: 'add-circle', route: '/create-tontine' },
  { id: 'notifications', label: 'Alertes', icon: 'notifications', route: '/notifications' },
  { id: 'profile', label: 'Profil', icon: 'person', route: '/profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const handleNavPress = (route: string) => {
    console.log('Navigate to:', route);
    if (route === '/') {
      router.push('/');
    } else {
      router.push(route as any);
    }
  };

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = isActive(item.route);
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => handleNavPress(item.route)}
          >
            <Icon 
              name={item.icon as any} 
              size={24} 
              color={active ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.navLabel,
              { color: active ? colors.primary : colors.textSecondary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
