#!/bin/bash

# Setup script for PocketBase with LLMDigest schema

echo "Setting up PocketBase for LLMDigest..."

# Check if old PocketBase exists and offer to remove it
if [ -f "pocketbase" ]; then
  echo "Found existing PocketBase installation."
  read -p "Do you want to remove it and install the latest version? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f pocketbase
    echo "Old PocketBase removed."
  else
    echo "Keeping existing PocketBase installation."
  fi
fi

# Create pb_migrations directory if it doesn't exist
mkdir -p pb_migrations

# Download PocketBase if not present
if [ ! -f "pocketbase" ]; then
  echo "Downloading PocketBase..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [[ $(uname -m) == "arm64" ]]; then
      # Apple Silicon
      curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.29.0/pocketbase_0.29.0_darwin_arm64.zip -o pocketbase.zip
    else
      # Intel
      curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.29.0/pocketbase_0.29.0_darwin_amd64.zip -o pocketbase.zip
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.29.0/pocketbase_0.29.0_linux_amd64.zip -o pocketbase.zip
  else
    echo "Unsupported OS. Please download PocketBase manually from https://github.com/pocketbase/pocketbase/releases"
    exit 1
  fi
  
  unzip pocketbase.zip
  rm pocketbase.zip
  chmod +x pocketbase
fi

# Create single migration file
cat > pb_migrations/001_init.js << 'EOF'
migrate((app) => {
  // Create digests collection
  const collection = new Collection({
    name: "digests",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      {
        name: "user_id",
        type: "text",
        required: true,
      },
      {
        name: "source_url",
        type: "text",
        required: true,
        max: 2048,
      },
      {
        name: "source_platform",
        type: "select",
        required: true,
        values: ["claude", "chatgpt", "gemini", "perplexity", "copilot", "grok"]
      },
      {
        name: "conversation_title",
        type: "text",
        required: true,
      },
      {
        name: "conversation_fingerprint",
        type: "text",
        required: true,
      },
      {
        name: "title",
        type: "text",
        required: true,
        min: 1,
        max: 200,
      },
      {
        name: "format",
        type: "select",
        required: true,
        values: ["executive-summary", "action-plan", "faq", "mind-map"]
      },
      {
        name: "processed_content",
        type: "json",
        required: false,
      },
      {
        name: "input_tokens",
        type: "number",
        required: false,
        min: 0,
      },
      {
        name: "output_tokens",
        type: "number",
        required: false,
        min: 0,
      },
      {
        name: "estimated_cost",
        type: "number",
        required: false,
        min: 0,
      },
      {
        name: "model_used",
        type: "text",
        required: false,
      },
      {
        name: "raw_content",
        type: "json",
        required: false,
      },
      {
        name: "metadata",
        type: "json",
        required: false,
      },
      {
        name: "created",
        type: "date",
        required: false,
      },
      {
        name: "updated",
        type: "date",
        required: false,
      }
    ],
    indexes: [
      "CREATE INDEX idx_user_id ON digests (user_id)",
      "CREATE INDEX idx_fingerprint ON digests (conversation_fingerprint)",
      "CREATE INDEX idx_platform ON digests (source_platform)"
    ],
  })

  app.save(collection)
  
  // Create superadmin
  const email = $os.getenv("SUPERADMIN_EMAIL")
  const password = $os.getenv("SUPERADMIN_PASS")
  
  if (email && password && email.includes("@") && password.length >= 8) {
    const superusers = app.findCollectionByNameOrId("_superusers")
    
    try {
      const existingAdmin = app.findAuthRecordByEmail("_superusers", email)
      if (!existingAdmin) {
        const record = new Record(superusers)
        record.set("email", email)
        record.set("password", password)
        app.save(record)
        console.log("✅ Superadmin created with email: " + email)
      }
    } catch {
      const record = new Record(superusers)
      record.set("email", email)
      record.set("password", password)
      app.save(record)
      console.log("✅ Superadmin created with email: " + email)
    }
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("digests")
  if (collection) {
    app.delete(collection)
  }
  
  const email = $os.getenv("SUPERADMIN_EMAIL")
  if (email) {
    try {
      const record = app.findAuthRecordByEmail("_superusers", email)
      if (record) {
        app.delete(record)
      }
    } catch {}
  }
})
EOF

echo "✅ PocketBase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure superadmin credentials in your main .env file:"
echo "   cp .env.example .env  # (from project root)"
echo "   # Edit .env and set SUPERADMIN_EMAIL and SUPERADMIN_PASS"
echo ""
echo "2. Run PocketBase (will auto-create superadmin if .env is configured):"
echo "   npm run pocketbase:start"
echo ""
echo "3. Open admin interface:"
echo "   http://localhost:8090/_/"
echo ""
echo "4. If you didn't set credentials in .env, create admin account manually in the UI"
echo ""
echo "🔗 API will be available at: http://localhost:8090/api/"
echo "📚 Collections: http://localhost:8090/api/collections/digests/records"