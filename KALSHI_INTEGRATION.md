# Kalshi Prediction Markets Integration

This guide explains how to use the Kalshi prediction markets integration in your dmusic React Native app.

## Features

- **Browse Markets**: View live Kalshi prediction markets in the Predictions tab
- **Place Bets**: Buy YES or NO contracts on prediction markets
- **Real-time Balance**: See your account balance in real-time
- **Market Details**: View market prices, expiration times, and categories
- **Tab Navigation**: Switch between Music predictions and Kalshi markets

## Setup Instructions

### 1. Install Required Dependencies

The Kalshi integration requires a React Native-compatible RSA cryptography library for signing API requests.

**Option A: Using react-native-rsa-native (Recommended)**

```bash
npm install react-native-rsa-native
cd ios && pod install && cd ..
# For Android, the library auto-links
```

**Option B: Using tweetnacl-js** 

```bash
npm install tweetnacl-js
# Modify kalshi-auth.ts to use tweetnacl
```

### 2. Configure API Credentials

The API credentials are already configured in `src/config.ts`:

```typescript
export const KALSHI_CONFIG = {
  apiKeyId: '7ee7a1e6-eb4b-401d-82d7-89a7ac6ea058',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
  isDemoMode: false, // Change to true to use demo environment
};
```

**To use environment variables instead (recommended for security):**

```bash
# Create .env file
EXPO_PUBLIC_KALSHI_API_KEY_ID=your-api-key-id
EXPO_PUBLIC_KALSHI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
```

## Usage

### In PredictionScreen.tsx

The Predictions screen now has two tabs:

1. **Music**: Vote on music tracks (original feature)
2. **Markets**: Browse and trade Kalshi prediction markets

Users can switch between tabs using the tab buttons at the top of the screen.

### Placing a Bet

1. Navigate to the Markets tab
2. Wait for markets to load
3. Select a market card
4. Choose YES or NO
5. Enter the number of contracts
6. Tap "Place Bet"

### Monitoring Your Balance

The balance is displayed in the hero section and updates after each bet is placed.

## File Structure

```
src/
├── services/
│   ├── kalshi-auth.ts      # RSA signing utilities
│   └── kalshi.ts           # Kalshi API service
├── components/
│   └── KalshiMarketCard.tsx # Market display component
├── screens/
│   └── PredictionScreen.tsx # Updated with Kalshi integration
├── types.ts                 # Kalshi type definitions
└── config.ts                # API configuration
```

## API Endpoints

The service uses the following Kalshi API endpoints:

- **GET `/markets`** - List available markets
- **GET `/markets/{ticker}`** - Get specific market details
- **GET `/portfolio/balance`** - Get account balance
- **POST `/portfolio/orders`** - Place a bet
- **GET `/portfolio/positions`** - Get user positions
- **GET `/portfolio/orders`** - Get user orders

## Error Handling

The integration includes error handling for:

- Network failures
- Invalid credentials
- Insufficient balance
- Market not found
- Order placement failures

Errors are displayed in the UI with user-friendly messages.

## Troubleshooting

### "React Native RSA module not available"

Install `react-native-rsa-native`:
```bash
npm install react-native-rsa-native
cd ios && pod install && cd ..
```

### "Kalshi API error 401: Unauthorized"

Check that your API credentials are correct in `config.ts` or environment variables.

### "Failed to load Kalshi data"

- Check network connectivity
- Verify API credentials
- Check that the API endpoint is accessible
- For demo mode, set `isDemoMode: true` in config

### Markets not loading

- Ensure you have an active internet connection
- Check that there are open markets available (may depend on time of day)
- Verify API credentials
- Check console logs for detailed error messages

## Security Considerations

⚠️ **IMPORTANT**: The private key should never be exposed in client-side code for production apps.

**For production:**

1. Move RSA signing to a backend server
2. Use environment variables for credentials
3. Implement proper authentication flow
4. Consider using OAuth or JWT tokens
5. Store the private key securely on the backend only

### Current Implementation

Currently, the private key is stored in the app config/env. For production, you should:

```typescript
// Backend approach (recommended):
// 1. Client makes request with order data
// 2. Backend signs the request with stored private key
// 3. Backend forwards to Kalshi API
// 4. Return result to client
```

## Testing

To test the integration:

1. Ensure you have a Kalshi account with API access
2. Generate API credentials from your Kalshi account settings
3. Update `config.ts` with your credentials
4. Run the app and navigate to the Predictions screen
5. Switch to the Markets tab
6. Markets should load and display

## Additional Resources

- [Kalshi API Documentation](https://docs.kalshi.com)
- [Kalshi Markets](https://kalshi.com/markets)
- [Quick Start Guide](https://docs.kalshi.com/getting_started/quick_start_market_data)

## Support

For issues with:

- **Kalshi API**: See [Kalshi Documentation](https://docs.kalshi.com)
- **React Native**: Check React Native community resources
- **This integration**: Review the code comments and error messages

## Future Enhancements

- [ ] WebSocket support for real-time market updates
- [ ] Market search and filtering
- [ ] Order history and analytics
- [ ] Portfolio management
- [ ] Notifications for market movements
- [ ] Advanced order types (market, stop-loss, etc.)
