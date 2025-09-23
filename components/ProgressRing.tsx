
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = colors.primary,
  backgroundColor = colors.border,
  children,
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background circle */}
      <View style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: backgroundColor,
        }
      ]} />
      
      {/* Progress circle - simplified version using border */}
      <View style={[
        styles.circle,
        styles.progressCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          transform: [{ rotate: `${(clampedProgress / 100) * 360 - 90}deg` }],
        }
      ]} />
      
      <View style={styles.content}>
        {children || (
          <Text style={[styles.progressText, { color }]}>
            {Math.round(clampedProgress)}%
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    // This creates a simple progress effect, though not as smooth as SVG
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
