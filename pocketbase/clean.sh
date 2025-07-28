#!/bin/bash

# Clean script for PocketBase

echo "Cleaning PocketBase installation..."

# Remove PocketBase binary
if [ -f "pocketbase" ]; then
  rm -f pocketbase
  echo "✅ PocketBase binary removed"
else
  echo "ℹ️  No PocketBase binary found"
fi

# Remove data directory
if [ -d "pb_data" ]; then
  echo ""
  echo "⚠️  Found pb_data directory - removing ALL DATA!"
  rm -rf pb_data
  echo "✅ pb_data removed"
fi

echo ""
echo "✅ Clean complete!"