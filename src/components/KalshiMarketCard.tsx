import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [stakeAmount, setStakeAmount] = useState('10');
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

    const stake = parseFloat(stakeAmount.replace(/,/g, '').trim());
    if (!Number.isFinite(stake) || stake <= 0) {
      setError('Enter a valid stake amount');
      return;
    }

    const price = selectedSide === 'yes' ? market.yes_bid_dollars : market.no_bid_dollars;
    const priceDollars = price / 100;
    const count = Math.max(1, Math.floor(stake / priceDollars));
    const totalCost = priceDollars * count;

    if (count <= 0) {
      setError('Stake is too small for the current price');
      return;
    }

    if (totalCost > balance) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onBet(selectedSide, price, count);
      setSelectedSide(null);
      setStakeAmount('10');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsLoading(false);
    }
  };

  const yesPrice = market.yes_bid_dollars / 100;
  const noPrice = market.no_bid_dollars / 100;
  const presetStakes = [5, 10, 25, 50];
  const selectedPrice = selectedSide === 'yes' ? yesPrice : noPrice;
  const stake = Number(stakeAmount.replace(/,/g, '').trim());
  const estimatedContracts = Number.isFinite(stake) && stake > 0 && selectedPrice > 0
    ? Math.max(1, Math.floor(stake / selectedPrice))
    : 0;
  const estimatedCost = estimatedContracts * selectedPrice;
  const estimatedPayout = estimatedContracts;
  const estimatedProfit = estimatedPayout - estimatedCost;
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
          <Text style={styles.subTitle} numberOfLines={1}>
            {market.event_ticker}
          </Text>
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
            <Text style={styles.betLabel}>Stake:</Text>
            <TextInput
              style={styles.betInput}
              placeholder="10"
              placeholderTextColor={withAlpha(theme.colors.text, 0.5)}
              value={stakeAmount}
              onChangeText={setStakeAmount}
              keyboardType="number-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.presetRow}>
            {presetStakes.map((amount) => (
              <Pressable
                key={amount}
                style={[styles.presetButton, stakeAmount === String(amount) && styles.presetButtonActive]}
                onPress={() => setStakeAmount(String(amount))}
                disabled={isLoading}
              >
                <Text style={[styles.presetText, stakeAmount === String(amount) && styles.presetTextActive]}>
                  ${amount}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLine}>
              Estimated contracts: {estimatedContracts > 0 ? estimatedContracts : '-'}
            </Text>
            <Text style={styles.summaryLine}>
              Estimated cost: ${estimatedCost.toFixed(2)}
            </Text>
            <Text style={styles.summaryLine}>
              If right: payout ${estimatedPayout.toFixed(2)} | profit ${estimatedProfit.toFixed(2)}
            </Text>
          </View>

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
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  category: {
    fontSize: 11,
    color: withAlpha(theme.colors.text, 0.6),
    marginTop: 2,
  },
  subTitle: {
    fontSize: 11,
    color: withAlpha(theme.colors.accent, 0.85),
    marginTop: 2,
    fontWeight: '700',
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
    backgroundColor: withAlpha(theme.colors.accent, 0.06),
    borderRadius: 14,
    padding: 12,
    gap: 10,
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
    paddingVertical: 8,
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
    fontWeight: '700',
    color: theme.colors.text,
  },
  betInput: {
    width: 86,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.accent, 0.3),
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  summaryBox: {
    gap: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: withAlpha(theme.colors.background, 0.55),
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.text, 0.06),
  },
  summaryLine: {
    fontSize: 12,
    color: withAlpha(theme.colors.text, 0.7),
    lineHeight: 18,
  },
  error: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  betButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  betButtonDisabled: {
    opacity: 0.5,
  },
  betButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
    fontSize: 13,
  },
});
