## System Patterns: LLM Digest

### Architecture Overview

- Next.js App Router architecture with server and client components
- TypeScript type system for strict type checking
- Component-based UI structure with reusable components
- API route handlers for backend functionality
- PocketBase integration for database operations

### Key Technical Decisions

- Use of multiple AI providers for redundancy and flexibility
- Offline development mode with mock data support
- Modular parser system for different content formats
- Extensible prompt system for various digest types
- Platform detection for adaptive functionality

### Design Patterns

- Factory pattern for AI provider selection
- Strategy pattern for different digest visualization types
- Repository pattern for database operations
- Singleton pattern for platform detection utilities
- Component composition for UI elements

### Component Relationships

- Dashboard components manage digest creation and viewing
- Visualization components render different digest formats
- Parser components handle content extraction
- AI components manage provider integration
- Database components handle data persistence

### Critical Implementation Paths

- AI digest generation pipeline
- Content parsing and extraction workflows
- Database integration with PocketBase
- Offline development and testing setup
- Platform-specific feature detection
