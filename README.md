# Origins

Origins is a full-stack Next.js application that integrates Model Context Protocol (MCP), GitHub OAuth, Supabase, and OpenAI to provide AI-powered features with secure authentication and data storage.

## Features

- Next.js App Router with React & TypeScript
- Model Context Protocol (MCP) API integration
- OpenAI API integration for text generation and embeddings
- GitHub OAuth login and user session management
- Supabase client for authentication, database, and storage
- Custom UI components library (Button, Card, Dialog, Form, Input, Label, LoginForm, Sheet)
- Tailwind CSS and PostCSS for styling
- ESLint and Prettier for code quality

## Tech Stack

- Next.js
- React & TypeScript
- Tailwind CSS
- Supabase
- GitHub API
- OpenAI API
- Vercel (deployment)

## Getting Started

### Prerequisites

- Node.js v16+
- npm, Yarn, pnpm, or bun

### Installation

```bash
git clone https://github.com/banana-hammers/origins.git
cd origins
npm install  # or yarn, pnpm
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
MCP_API_URL=https://your-mcp-endpoint
OPENAI_API_KEY=your_openai_api_key
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the app.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
/README.md
next.config.ts
tsconfig.json
package.json
docs/
  └─ openai-integration.md  # Documentation for OpenAI integration
src/
  ├─ app/           # Next.js App Router pages and API routes
  │  └─ api/        # API routes including OpenAI endpoints
  ├─ components/    # Reusable UI components
  ├─ scripts/       # Utility scripts including OpenAI testing
  └─ lib/           # Auth, MCP client, Supabase client, OpenAI service, utilities
public/             # Static assets
```

## OpenAI Integration

This project includes OpenAI API integration with support for:
- Text generation using GPT models
- Text embedding generation

See the [OpenAI integration documentation](docs/openai-integration.md) for details on usage and examples.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements.

## License

This project is licensed under the MIT License.
