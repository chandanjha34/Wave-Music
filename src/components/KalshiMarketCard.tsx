import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme, withAlpha } from '../theme';
import { KalshiMarket } from '../services/kalshi';

interface KalshiMarketCardProps {
  market: KalshiMarket;
  onBet: (side: 'yes' | 'no', price: number, count: number) => Promise<void>;
  disabled?: boolean;
  balance?: number;
  authRequired?: boolean;
}

export function KalshiMarketCard({
  market,
  onBet,
  disabled = false,
  balance = 0,
  authRequired = false,
}: KalshiMarketCardProps) {
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [betCount, setBetCount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBet = async () => {
    if (authRequired) {
      setError('Authentication required to place bets');
      return;
    }

    if (!selectedSide) {
      setError('Please select YES or NO');
      return;
    }

    const count = parseInt(betCount, 10);
    if (isNaN(count) || count <= 0) {
      setError('Invalid bet amount');
      return;
    }

    const price = selectedSide === 'yes' ? market.yes_bid_dollars : market.no_bid_dollars;
    const totalCost = (price / 100) * count;

    if (totalCost > balance) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onBet(selectedSide, price, count);
      setSelectedSide(null);
      setBetCount('1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsLoading(false);
    }
  };

  const yesPrice = market.yes_bid_dollars / 100;
  const noPrice = market.no_bid_dollars / 100;
  const presetCounts = [1, 5, 10, 25];
  const expiresAt = new Date(market.expiration_time);
  const hoursUntilExpiry = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {market.title}
          </Text>
          {market.category && (
            <Text style={styles.category}>{market.category}</Text>
          )}
        </View>
        <View style={styles.expiryBadge}>
          <Ionicons
            name="time-outline"
            size={12}
            color={theme.colors.accent}
          />
          <Text style={styles.expiryText}>{hoursUntilExpiry}h</Text>
        </View>
      </View>

      <View style={styles.pricesContainer}>
        <Pressable
          style={[
            styles.priceButton,
            selectedSide === 'yes' && styles.priceButtonActive,
          ]}
          onPress={() => setSelectedSide('yes')}
          disabled={disabled || isLoading}
        >
          <Text style={styles.priceLabel}>YES</Text>
          <Text
            style={[
              styles.priceValue,
              selectedSide === 'yes' && styles.priceValueActive,
            ]}
          >
            ${yesPrice.toFixed(2)}
          </Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={[
            styles.priceButton,
            selectedSide === 'no' && styles.priceButtonActive,
          ]}
          onPress={() => setSelectedSide('no')}
          disabled={disabled || isLoading}
        >
          <Text style={styles.priceLabel}>NO</Text>
          <Text
            style={[
              styles.priceValue,
              selectedSide === 'no' && styles.priceValueActive,
            ]}
          >
            ${noPrice.toFixed(2)}
          </Text>
        </Pressable>
      </View>

      {selectedSide && (
        <View style={styles.betSection}>
          <View style={styles.betInputContainer}>
            <Text style={styles.betLabel}>Contracts:</Text>
            <TextInput
              style={styles.betInput}
              placeholder="1"
              placeholderTextColor={withAlpha(theme.colors.text, 0.5)}
              value={betCount}
              onChangeText={setBetCount}
              keyboardType="number-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.presetRow}>
            {presetCounts.map((count) => (
              <Pressable
                key={count}
                style={[styles.presetButton, betCount === String(count) && styles.presetButtonActive]}
                onPress={() => setBetCount(String(count))}
                disabled={isLoading}
              >
                <Text style={[styles.presetText, betCount === String(count) && styles.presetTextActive]}>
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <Text style={styles.costText}>
              Cost: ${((selectedSide === 'yes' ? yesPrice : noPrice) * parseInt(betCount || '0', 10)).toFixed(2)}
            </Text>
          )}

          <Pressable
            style={[
              styles.betButton,
              isLoading && styles.betButtonDisabled,
            ]}
            onPress={handleBet}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.betButtonText}>
                Place {selectedSide.toUpperCase()} Bet
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: withAlpha(theme.colors.background, 0.8),
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.accent, 0.2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  category: {
    fontSize: 11,
    color: withAlpha(theme.colors.text, 0.6),
    marginTop: 2,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(theme.colors.accent, 0.1),
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  expiryText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  pricesContainer: {
    flexDirection: 'row',
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  priceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceButtonActive: {
    backgroundColor: withAlpha(theme.colors.accent, 0.15),
  },
  priceLabel: {
    fontSize: 10,
    color: withAlpha(theme.colors.text, 0.6),
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
  },
  priceValueActive: {
    color: theme.colors.accent,
  },
  divider: {
    width: 1,
    backgroundColor: withAlpha(theme.colors.text, 0.1),
  },
  betSection: {
    backgroundColor: withAlpha(theme.colors.accent, 0.05),
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  betInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.text, 0.08),
  },
  presetButtonActive: {
    backgroundColor: withAlpha(theme.colors.accent, 0.15),
    borderColor: withAlpha(theme.colors.accent, 0.35),
  },
  presetText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  presetTextActive: {
    color: theme.colors.accent,
  },
  betLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  betInput: {
    width: 60,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.accent, 0.3),
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  costText: {
    fontSize: 12,
    color: withAlpha(theme.colors.text, 0.7),
    textAlign: 'right',
  },
  error: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  betButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  betButtonDisabled: {
    opacity: 0.5,
  },
  betButtonText: {
    color: theme.colors.background,
    fontWeight: '600',
    fontSize: 13,
  },
});
