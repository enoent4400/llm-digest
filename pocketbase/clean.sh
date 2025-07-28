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

# Ask about data removal
if [ -d "pb_data" ]; then
  echo ""
  echo "⚠️  Found pb_data directory"
  read -p "Do you want to remove pb_data? This will DELETE ALL DATA! (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf pb_data
    echo "✅ pb_data removed"
  else
    echo "ℹ️  Keeping pb_data"
  fi
fi

echo ""
echo "✅ Clean complete!"