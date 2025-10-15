#!/bin/bash

# Build script for StackSpot Figma Plugin

echo "Building StackSpot Figma Plugin..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist/

# Create dist directory
mkdir -p dist/

# Copy UI file
echo "Copying UI files..."
cp src/ui.html dist/ui.html

# Compile TypeScript
echo "Compiling TypeScript..."
npx tsc

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Output files:"
    echo "   - dist/code.js (main plugin code)"
    echo "   - dist/ui.html (plugin UI)"
    echo ""
    echo "🚀 Ready to load in Figma:"
    echo "   1. Open Figma Desktop App"
    echo "   2. Go to Plugins → Development → Import plugin from manifest..."
    echo "   3. Select the manifest.json file"
else
    echo "❌ Build failed!"
    exit 1
fi
