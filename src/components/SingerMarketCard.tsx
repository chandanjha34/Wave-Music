import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SingerMusicMarket } from '../types';
import { theme, withAlpha } from '../theme';

interface SingerMarketCardProps {
  market: SingerMusicMarket;
  onQuote: (market: SingerMusicMarket, quote: number, amount: number) => Promise<void>;
}

export function SingerMarketCard({ market, onQuote }: SingerMarketCardProps) {
  const [quote, setQuote] = useState(String(market.suggestedQuote));
  const [amount, setAmount] = useState('10');
  const [showBetForm, setShowBetForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const metricLabel = market.metric === 'likes' ? 'Likes' : 'Views';
  const sourceLabel = market.source === 'apple-metadata' ? 'apple music metadata' : 'fallback market model';
  const formattedLine = useMemo(
    () => market.currentLine.toLocaleString(),
    [market.currentLine],
  );

  const handleQuote = async () => {
    const parsed = Number(quote.replace(/,/g, '').trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid number');
      return;
    }

    setShowBetForm(true);
    setError('');
  };

  const handleSubmitBet = async () => {
    const parsedQuote = Number(quote.replace(/,/g, '').trim());
    if (!Number.isFinite(parsedQuote) || parsedQuote <= 0) {
      setError('Enter a valid quote');
      return;
    }

    const parsedAmount = Number(amount.replace(/,/g, '').trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid betting amount');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onQuote(market, parsedQuote, parsedAmount);
      setShowBetForm(false);
    } catch (quoteError) {
      setError(quoteError instanceof Error ? quoteError.message : 'Failed to submit quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedAmount = Number(amount.replace(/,/g, '').trim());
  const estimatedReturn = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount * 1.8 : 0;
  const estimatedProfit = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount * 0.8 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.singer}>{market.singerName}</Text>
          <Text style={styles.song}>{market.songTitle}</Text>
          {market.albumName ? <Text style={styles.album}>{market.albumName}</Text> : null}
          <Text style={styles.question}>{market.question}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="bar-chart" size={12} color={theme.colors.accent} />
          <Text style={styles.badgeText}>{metricLabel}</Text>
        </View>
      </View>

      <View style={styles.lineRow}>
        <Text style={styles.lineLabel}>Current line</Text>
        <Text style={styles.lineValue}>{formattedLine}</Text>
      </View>

      <View style={styles.quoteRow}>
        <TextInput
          value={quote}
          onChangeText={setQuote}
          keyboardType="number-pad"
          placeholder="quote a number"
          placeholderTextColor={withAlpha(theme.colors.text, 0.45)}
          style={styles.input}
        />
        <Pressable onPress={() => void handleQuote()} style={styles.button} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? '...' : 'quote'}</Text>
        </Pressable>
      </View>

      {showBetForm ? (
        <View style={styles.betPanel}>
          <Text style={styles.betTitle}>betting amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={withAlpha(theme.colors.text, 0.45)}
              style={styles.amountInput}
              editable={!isSubmitting}
            />
            <Pressable onPress={() => void handleSubmitBet()} style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.submitText}>place bet</Text>
              )}
            </Pressable>
          </View>
          <Text style={styles.payoutText}>
            If correct, you get 80% return on your stake. Stake {Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'} -> return {estimatedReturn.toFixed(2)} total, profit {estimatedProfit.toFixed(2)}.
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.source}>{sourceLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: withAlpha(theme.colors.surface, 0.94),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  singer: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  song: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  album: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  question: {
    color: theme.colors.muted,
    lineHeight: 18,
    fontSize: 13,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: withAlpha(theme.colors.accent, 0.12),
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: withAlpha(theme.colors.text, 0.06),
  },
  lineLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  lineValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  quoteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  betPanel: {
    gap: 10,
    padding: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: withAlpha(theme.colors.accent, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(theme.colors.accent, 0.18),
  },
  betTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 10,
  },
  amountInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  submitText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payoutText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 12,
  },
  source: {
    color: theme.colors.muted,
    fontSize: 11,
    textTransform: 'lowercase',
  },
});