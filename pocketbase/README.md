# PocketBase Setup for LLMDigest

## Quick Start

1. Download PocketBase:
```bash
# Download and setup PocketBase
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.24.2/pocketbase_0.24.2_linux_amd64.zip -o pocketbase.zip
unzip pocketbase.zip
```

2. Run setup script:
```bash
./setup.sh
```

3. Start PocketBase:
```bash
./pocketbase serve
```

## Collections

### digests
- **id** (text, primary key, auto-generated)
- **user_id** (text, default: "anonymous")
- **source_url** (text, required)
- **source_platform** (text, required)
- **conversation_title** (text, required)
- **conversation_fingerprint** (text, required)
- **title** (text, required)
- **format** (text, required)
- **processed_content** (json)
- **input_tokens** (number, default: 0)
- **output_tokens** (number, default: 0)
- **estimated_cost** (number, default: 0)
- **model_used** (text)
- **raw_content** (json)
- **metadata** (json)
- **created** (datetime, auto)
- **updated** (datetime, auto)

## API Usage

Base URL: `http://localhost:8090/api/`

### Create Digest
```bash
POST /api/collections/digests/records
```

### Get Digest
```bash
GET /api/collections/digests/records/:id
```

### List Digests
```bash
GET /api/collections/digests/records?filter=(user_id='anonymous')
```

### Update Digest
```bash
PATCH /api/collections/digests/records/:id
```

### Delete Digest
```bash
DELETE /api/collections/digests/records/:id
```