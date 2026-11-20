import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEBSITE_URL = (
  process.env.EXPO_PUBLIC_WEBSITE_URL?.trim() || 'https://bazaarr-lac.vercel.app'
).replace(/\/+$/, '');

export function BazaarWebsite() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        key={reloadKey}
        source={{ uri: WEBSITE_URL }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && !error ? (
        <View pointerEvents="none" style={styles.overlay}>
          <ActivityIndicator color="#1769AA" size="large" />
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.title}>Couldn’t load Bazaar</Text>
          <Text style={styles.message}>Check your internet connection and try again.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setError(false);
              setLoading(true);
              setReloadKey((key) => key + 1);
            }}
            style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FD',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F6F9FD',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F9FD',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F6F9FD',
  },
  title: {
    color: '#14243B',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    color: '#53647A',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    borderRadius: 24,
    backgroundColor: '#14243B',
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  retryText: {
    color: '#F6F9FD',
    fontSize: 15,
    fontWeight: '600',
  },
});
