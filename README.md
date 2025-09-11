# LLM Digest

Transform AI conversations into structured insights. Import chats from various AI platforms and visualize the information through different formats like mind maps, timelines.

## Features

- **Multi-platform support**: Import conversations from ChatGPT, Claude, Gemini, Grok, and other AI platforms
- **Bring your own API key**: Use your own API keys for AI processing
- **Self-hosted**: Deploy on your own infrastructure
- **Open source**: MIT licensed

### Planned Visualizations

- [ ] Executive summaries for quick insights
- [ ] Code organization for technical conversations
- [ ] Mind maps (React Flow implementation)
- [ ] Blog post generation from digests (with AI-generated images and SEO optimization)

## Quick Start

### Development with Mock Database

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Development with PocketBase

```bash
# Setup PocketBase
npm run pocketbase:setup
npm run pocketbase:start

# In another terminal, start the app
DATABASE_TYPE=pocketbase npm run dev
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Database Configuration
DATABASE_TYPE=mock  # or 'pocketbase'
POCKETBASE_URL=http://localhost:8090

# AI Provider
OPENROUTER_API_KEY=your_api_key_here
```

## Production Deployment

### Build

```bash
npm run build
npm start
```

### PocketBase Setup

```bash
# Setup PocketBase for production
./pocketbase/setup.sh

# Start PocketBase server
./pocketbase/pocketbase serve
```

## Technology Stack

- **Framework**: Next.js 15
- **Database**: PocketBase (with mock fallback for development)
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Processing**: OpenAI GPT models via OpenRouter
- **Deployment**: Vercel, Netlify, or self-hosted

## Project Structure

```
├── app/                   # Next.js app router pages and API routes
├── components/            # Reusable React components
├── lib/                   # Core application logic
│   ├── ai/               # AI processing and prompt management
│   ├── database/         # Database abstraction layer
│   ├── parsers/          # Platform-specific chat parsers
│   └── platform/         # Platform detection utilities
├── pocketbase/           # Database setup and configuration
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -am 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.
