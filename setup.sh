#!/bin/bash

echo "🚀 Setting up Gaze Calibration Viewer..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📁 Next steps:"
    echo "   1. Copy your calibration data:"
    echo "      cp -r ~/Desktop/calibration_sessions ./public/"
    echo ""
    echo "   2. Start the dev server:"
    echo "      npm run dev"
    echo ""
    echo "   3. Open http://localhost:3000 in your browser"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi