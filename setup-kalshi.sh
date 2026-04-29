#!/bin/bash

# Kalshi Integration Setup Script
# This script installs required dependencies for Kalshi integration

echo "🚀 Kalshi Integration Setup"
echo "============================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing react-native-rsa-native for RSA signing..."
npm install react-native-rsa-native

echo ""
echo "📱 For iOS development:"
echo "   1. Navigate to iOS folder: cd ios"
echo "   2. Install pods: pod install"
echo "   3. Return to root: cd .."
echo ""
echo "🤖 For Android development:"
echo "   The library auto-links, so no additional steps needed."
echo ""

# Check if iOS setup is needed
read -p "Do you need to set up iOS pods now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd ios
    echo "Running: pod install"
    pod install
    cd ..
    echo "✅ iOS setup complete"
fi

echo ""
echo "✅ Kalshi integration setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update your API credentials in src/config.ts"
echo "   2. Or set environment variables:"
echo "      - EXPO_PUBLIC_KALSHI_API_KEY_ID"
echo "      - EXPO_PUBLIC_KALSHI_PRIVATE_KEY"
echo "   3. Start the app: npm start"
echo ""
echo "📚 For more information, see KALSHI_INTEGRATION.md"
