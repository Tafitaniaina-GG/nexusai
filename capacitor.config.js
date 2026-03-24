/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.nexusai.app',
  appName: 'NexusAI',
  webDir: 'out',
  server: { androidScheme: 'https' },
  android: { allowMixedContent: true, webContentsDebuggingEnabled: false },
  plugins: {
    SplashScreen: { launchShowDuration: 1500, backgroundColor: '#F5F7FF', showSpinner: false },
    StatusBar: { style: 'Light', backgroundColor: '#F5F7FF' },
    Keyboard: { resize: 'body', style: 'light', resizeOnFullScreen: true },
  },
}

module.exports = config
