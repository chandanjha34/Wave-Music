import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { KALSHI_CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';
import { SingerMarketCard } from '../components/SingerMarketCard';
import { KalshiMarketCard } from '../components/KalshiMarketCard';
import { api } from '../services/api';
import { KalshiMarket, KalshiService } from '../services/kalshi';
import { SingerMusicMarket } from '../types';
import { theme, withAlpha } from '../theme';

const MUSIC_MARKET_PATTERNS = [
  /\bmusic\b/i,
  /\bsong(s)?\b/i,
  /\balbum(s)?\b/i,
  /\bartist(s)?\b/i,
  /\bsinger(s)?\b/i,
  /\brapper(s)?\b/i,
  /\bband(s)?\b/i,
  /\bperformer(s)?\b/i,
  /\bspotify\b/i,
  /\bapple music\b/i,
  /\bbillboard\b/i,
  /\bgrammy(ies)?\b/i,
  /\baward(s)?\b/i,
  /\bconcert(s)?\b/i,
  /\btour(s)?\b/i,
  /\bsingle(s)?\b/i,
  /\btrack(s)?\b/i,
  /\bplaylist(s)?\b/i,
  /\bstream(ing|s)?\b/i,
  /\blisten(ing|s)?\b/i,
  /\bview(s)?\b/i,
  /\blike(s)?\b/i,
  /\bchart(s)?\b/i,
  /\btop 100\b/i,
  /\bhot 100\b/i,
  /\bnumber one\b/i,
  /\b#1\b/i,
];

const isMusicRelatedKalshiMarket = (market: KalshiMarket) => {
  const haystack = [
    market.title,
    market.subtitle,
    market.description,
    market.category,
    market.event_ticker,
    market.settlement_source,
    market.ticker,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return MUSIC_MARKET_PATTERNS.some((pattern) => pattern.test(haystack));
};

export function PredictionScreen() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'music' | 'kalshi'>('music');
  const [musicMarkets, setMusicMarkets] = useState<SingerMusicMarket[]>([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicStatus, setMusicStatus] = useState('');

  const [kalshiMarkets, setKalshiMarkets] = useState<KalshiMarket[]>([]);
  const [kalshiLoading, setKalshiLoading] = useState(false);
  const [kalshiError, setKalshiError] = useState('');
  const [kalshiNotice, setKalshiNotice] = useState('');
  const [kalshiBalance, setKalshiBalance] = useState(0);

  const kalshiService = useMemo(() => {
    try {
      return new KalshiService(KALSHI_CONFIG.apiKeyId, KALSHI_CONFIG.privateKey);
    } catch (error) {
      console.error('Failed to initialize Kalshi service:', error);
      return null;
    }
  }, []);

  const loadMusicMarkets = async () => {
    setMusicLoading(true);
    try {
      const markets = await api.getSingerMarkets(8);
      setMusicMarkets(markets);
      setMusicStatus(markets.length > 0 ? '' : 'No singer markets available right now.');
    } catch (error) {
      console.error('Failed to load music markets:', error);
      setMusicMarkets([]);
      setMusicStatus('Unable to load singer markets right now.');
    } finally {
      setMusicLoading(false);
    }
  };

  const loadKalshiData = async () => {
    if (!kalshiService) {
      setKalshiError('Failed to initialize Kalshi service');
      return;
    }

    setKalshiLoading(true);
    setKalshiError('');
    setKalshiNotice('');

    try {
      let markets: KalshiMarket[] = [];
      let balance = 0;
      let authUnavailable = false;

      try {
        markets = await kalshiService.getOpenMarkets(undefined, 20);
        const balanceData = await kalshiService.getBalance();
        if (balanceData) {
          balance = balanceData.balance / 100;
        }
      } catch (authError) {
        console.warn('Auth failed, loading public markets:', authError);
        markets = await KalshiService.getPublicMarkets(20);
        authUnavailable = true;
      }

      const musicMarketsOnly = markets.filter(isMusicRelatedKalshiMarket);
      const marketsToShow = musicMarketsOnly.length > 0 ? musicMarketsOnly : markets;

      setKalshiMarkets(marketsToShow);
      setKalshiBalance(balance);

      if (musicMarketsOnly.length === 0) {
        if (markets.length > 0) {
          setKalshiNotice('No music-specific markets found right now. Showing all open markets instead.');
        } else {
          setKalshiError('No markets available right now.');
        }
      } else if (authUnavailable) {
        setKalshiNotice('Showing public markets while authenticated access is unavailable.');
      }
    } catch (error) {
      console.error('Failed to load Kalshi data:', error);
      setKalshiError('Failed to load prediction markets. Please check your connection.');
    } finally {
      setKalshiLoading(false);
    }
  };

  useEffect(() => {
    void loadMusicMarkets();
  }, []);

  const handleMusicQuote = async (market: SingerMusicMarket, quote: number, amount: number) => {
    const result = await api.submitSingerMarketQuote(market.id, quote, amount);
    if (result.ok) {
      setMusicStatus(`${market.singerName} ${market.metric} quoted at ${quote.toLocaleString()} with ${amount.toLocaleString()} stake`);
      return;
    }

    setMusicStatus('Failed to submit quote.');
  };

  const handleKalshiBet = async (
    market: KalshiMarket,
    side: 'yes' | 'no',
    price: number,
    count: number
  ) => {
    if (!kalshiService) {
      setKalshiError('Kalshi service not available');
      return;
    }

    try {
      const order = {
        ticker: market.ticker,
        side,
        action: 'buy' as const,
        count,
        type: 'limit' as const,
        [side === 'yes' ? 'yes_price' : 'no_price']: Math.round(price * 100),
        client_order_id: `${market.ticker}_${Date.now()}`,
      };

      await kalshiService.placeBet(order);
      setKalshiError('');
      await loadKalshiData();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to place bet';
      setKalshiError(errorMsg);
      throw error;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>prediction desk</Text>
        <Text style={styles.heroTitle}>quote singer markets and trade opinions</Text>
        <Text style={styles.heroCopy}>
          {activeTab === 'music'
            ? 'Browse singer markets powered by live iTunes metadata and quote a weekly views or likes number.'
            : 'Place bets on Kalshi prediction markets'}
        </Text>
        <View style={styles.creditsRow}>
          <Ionicons name="star" size={16} color={theme.colors.accent} />
          <Text style={styles.creditsText}>
            {activeTab === 'music' ? `${user?.credits ?? 0} credits` : `$${kalshiBalance.toFixed(2)} balance`}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <Pressable style={[styles.tab, activeTab === 'music' && styles.tabActive]} onPress={() => setActiveTab('music')}>
          <Ionicons name="musical-notes" size={16} color={activeTab === 'music' ? theme.colors.accent : theme.colors.muted} />
          <Text style={[styles.tabLabel, activeTab === 'music' && styles.tabLabelActive]}>Music</Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'kalshi' && styles.tabActive]}
          onPress={() => {
            setActiveTab('kalshi');
            void loadKalshiData();
          }}
        >
          <Ionicons name="trending-up" size={16} color={activeTab === 'kalshi' ? theme.colors.accent : theme.colors.muted} />
          <Text style={[styles.tabLabel, activeTab === 'kalshi' && styles.tabLabelActive]}>Markets</Text>
        </Pressable>
      </View>

      {activeTab === 'music' ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>singer quote markets</Text>
            <Text style={styles.sectionHint}>live iTunes metadata</Text>
          </View>

          {musicLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Loading singer markets...</Text>
            </View>
          ) : musicMarkets.length > 0 ? (
            <FlatList<SingerMusicMarket>
              data={musicMarkets}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => <SingerMarketCard market={item} onQuote={handleMusicQuote} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={42} color={withAlpha(theme.colors.text, 0.3)} />
              <Text style={styles.emptyText}>No singer markets available right now.</Text>
            </View>
          )}

          {musicStatus ? <Text style={styles.status}>{musicStatus}</Text> : null}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>prediction markets</Text>

          {kalshiError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{kalshiError}</Text>
            </View>
          ) : null}

          {kalshiNotice ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>{kalshiNotice}</Text>
            </View>
          ) : null}

          {kalshiLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Loading markets...</Text>
            </View>
          ) : kalshiMarkets.length > 0 ? (
            <FlatList<KalshiMarket>
              data={kalshiMarkets}
              keyExtractor={(item) => item.ticker}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <KalshiMarketCard
                  market={item}
                  onBet={(side, price, count) => handleKalshiBet(item, side, price, count)}
                  balance={kalshiBalance}
                  authRequired={kalshiError.includes('public markets')}
                />
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-down" size={48} color={withAlpha(theme.colors.text, 0.3)} />
              <Text style={styles.emptyText}>No markets available</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  hero: {
    backgroundColor: withAlpha(theme.colors.surface, 0.92),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 8,
  },
  heroLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'lowercase',
    fontWeight: '700',
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  heroCopy: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  creditsText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    gap: 6,
  },
  tabActive: {
    backgroundColor: withAlpha(theme.colors.accent, 0.15),
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  tabLabelActive: {
    color: theme.colors.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'lowercase',
  },
  sectionHint: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'lowercase',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  errorCard: {
    backgroundColor: withAlpha('#FF6B6B', 0.1),
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
  },
  noticeCard: {
    backgroundColor: withAlpha(theme.colors.accent, 0.12),
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  noticeText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  status: {
    color: theme.colors.muted,
    fontSize: 12,
  },
});