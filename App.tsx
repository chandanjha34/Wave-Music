import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LibraryProvider } from './src/context/LibraryContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { PredictionScreen } from './src/screens/PredictionScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlaylistImportScreen } from './src/screens/PlaylistImportScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ScreenContainer } from './src/components/ScreenContainer';
import { MiniPlayer } from './src/components/MiniPlayer';
import { TabBar } from './src/components/TabBar';
import { theme } from './src/theme';
import Toast from 'react-native-toast-message';

function Shell() {
  const { user } = useAuth();
  const { activeTab, overlay } = useNavigation();

  const content = (() => {
    switch (activeTab) {
      case 'search':
        return <SearchScreen />;
      case 'prediction':
        return <PredictionScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'import':
        return <PlaylistImportScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  })();

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      {user ? (
        <>
          <ScreenContainer>
            {content}
            <MiniPlayer />
          </ScreenContainer>
          <View style={styles.fixedTabs} pointerEvents="box-none">
            <TabBar />
          </View>
        </>
      ) : (
        <LoginScreen />
      )}

      {overlay === 'player' ? <PlayerScreen /> : null}
      {overlay === 'profile' ? <ProfileScreen /> : null}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationProvider>
          <LibraryProvider>
            <PlayerProvider>
              <SafeAreaView style={styles.root}>
                <Shell />
                <Toast topOffset={56} />
              </SafeAreaView>
            </PlayerProvider>
          </LibraryProvider>
        </NavigationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  shell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fixedTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
});