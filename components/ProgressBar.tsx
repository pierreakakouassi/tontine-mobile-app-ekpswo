
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
}

export default function ProgressBar({
  progress,
  height = 8,
  color = colors.primary,
  backgroundColor = colors.border,
  showPercentage = false,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View style={[
        styles.track,
        {
          height,
          backgroundColor,
        }
      ]}>
        <View style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            height,
            backgroundColor: color,
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
});
