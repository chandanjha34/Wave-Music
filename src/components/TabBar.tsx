import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '../context/NavigationContext';
import { TabKey } from '../types';
import { theme, withAlpha } from '../theme';

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; accent?: boolean }> = [
  { key: 'home', label: 'home', icon: 'home' },
  { key: 'search', label: 'search', icon: 'search' },
  { key: 'prediction', label: 'prediction', icon: 'sparkles', accent: true },
  { key: 'library', label: 'library', icon: 'library' },
  { key: 'import', label: 'import', icon: 'share-social' },
];

export function TabBar() {
  const { activeTab, setTab } = useNavigation();

  return (
    <View style={styles.frame}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const iconColor = active ? (tab.accent ? theme.colors.accent3 : theme.colors.text) : withAlpha(theme.colors.text, 0.45);

        return (
          <Pressable
            key={tab.key}
            onPress={() => setTab(tab.key)}
            style={[styles.item, active && styles.itemActive, tab.accent && active && styles.itemAccent]}
          >
            <Ionicons name={tab.icon} size={20} color={iconColor} />
            <Text style={[styles.label, active && styles.labelActive, tab.accent && active && styles.labelAccent]} numberOfLines={1}>
              {tab.label}
            </Text>
            <View style={[styles.dot, active && styles.dotActive, tab.accent && active && styles.dotAccent]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopColor: theme.colors.border,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(10,10,15,0.92)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 28,
    ...theme.shadow,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 22,
  },
  itemActive: {
    backgroundColor: withAlpha(theme.colors.text, 0.06),
  },
  itemAccent: {
    backgroundColor: withAlpha(theme.colors.accent3, 0.12),
  },
  label: {
    color: withAlpha(theme.colors.text, 0.45),
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  labelActive: {
    color: theme.colors.text,
  },
  labelAccent: {
    color: theme.colors.accent3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
  },
  dotAccent: {
    backgroundColor: theme.colors.accent3,
  },
});