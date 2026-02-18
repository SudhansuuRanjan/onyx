#!/bin/bash

# Configuration
APP_PATH="build/dev-macos-arm64/Onyx-dev.app"
DMG_NAME="build/Onyx.dmg"
VOL_NAME="Onyx"
STAGING_DIR="build/dmg-staging"

# Check if App exists
if [ ! -d "$APP_PATH" ]; then
    echo "Error: App bundle not found at $APP_PATH"
    echo "Please run 'bun run build' first."
    exit 1
fi

echo "Packaging $APP_PATH into $DMG_NAME..."

# Clean up previous build
rm -rf "$STAGING_DIR" "$DMG_NAME"
mkdir -p "$STAGING_DIR"

# Copy App to staging
echo "Copying app to staging..."
cp -R "$APP_PATH" "$STAGING_DIR/"

# Create /Applications symlink
echo "Creating /Applications shortcut..."
ln -s /Applications "$STAGING_DIR/Applications"

# Create DMG
echo "Creating DMG..."
hdiutil create -volname "$VOL_NAME" -srcfolder "$STAGING_DIR" -ov -format UDZO "$DMG_NAME"

# Clean up staging
rm -rf "$STAGING_DIR"

echo "Done! DMG created at $DMG_NAME"
