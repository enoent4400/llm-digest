## Project Brief: LLM Digest Web Application

### Overview

A Next.js web application that creates AI-powered digests of various content types (web pages, documents, etc.) using multiple LLM providers. The application provides a dashboard interface for managing digests and various visualization formats.

### Core Features

- Content parsing from URLs and various formats (HTML, JSON)
- AI digest generation using multiple providers (Gemini, ChatGPT, Claude, Grok, Copilot)
- Dashboard for managing and viewing digests
- Multiple digest visualization formats (executive summary, code blocks, etc.)
- Database integration with PocketBase
- Platform detection capabilities

### Project Structure

- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- PocketBase for database management
- Multiple AI provider integrations
- Component-based architecture with UI library components

### Goals

- Provide comprehensive AI analysis of content in various formats
- Maintain a clean, user-friendly dashboard interface
- Support multiple LLM providers for redundancy and choice
- Enable offline development with mock data
- Create extensible architecture for adding new digest types
