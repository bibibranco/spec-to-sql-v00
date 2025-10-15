# StackSpot Figma Plugin

A Figma plugin for integrating with StackSpot's Tagueamento API. This plugin allows you to authenticate with StackSpot and process nodes containing "tagueamento" text.

## Features

- **Authentication**: Secure OAuth2 client credentials flow with StackSpot API
- **Credential Storage**: Safe storage of credentials and tokens using Figma's clientStorage
- **Token Management**: Automatic token refresh and expiration handling
- **Clean Architecture**: TypeScript-based with proper separation of concerns

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the plugin**:
   ```bash
   npm run build
   ```

3. **Development mode** (with auto-rebuild):
   ```bash
   npm run dev
   ```

## Installation in Figma

1. Open Figma Desktop App
2. Go to Plugins → Development → Import plugin from manifest...
3. Select the `manifest.json` file from this project
4. The plugin will appear in your plugins list

## Usage

1. **First time setup**: When you first run the plugin, you'll see an authentication form
2. **Enter credentials**: Input your StackSpot Client ID and Client Secret
3. **Authentication**: The plugin will authenticate with StackSpot and store your credentials securely
4. **Future runs**: The plugin will automatically authenticate using stored credentials

## Architecture

### Files Structure

```
├── manifest.json          # Figma plugin configuration
├── src/
│   ├── code.ts           # Main plugin logic (runs in Figma)
│   └── ui.html           # Plugin UI (runs in iframe)
├── dist/                 # Compiled output (generated)
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

### Key Components

- **StackSpotPlugin**: Main class handling authentication and plugin lifecycle
- **UI Communication**: Clean postMessage-based communication between main code and UI
- **Storage Management**: Secure credential and token storage using figma.clientStorage
- **Error Handling**: Comprehensive error handling with user-friendly messages

## API Integration

The plugin integrates with StackSpot's OAuth2 API:

- **Authentication Endpoint**: `https://api.stackspot.com/oauth/token`
- **Grant Type**: `client_credentials`
- **Token Storage**: Access tokens with expiration timestamps

## Development

### Building

```bash
# One-time build
npm run build

# Watch mode for development
npm run dev
```

### TypeScript

The project uses strict TypeScript configuration with:
- ES2020 target
- Strict type checking
- Source maps for debugging
- Declaration files

## Next Steps

This plugin currently handles authentication. Future development will include:

1. **Node Querying**: Find all nodes containing "tagueamento" text
2. **StackSpot Integration**: Send node data to StackSpot Quick Command API
3. **Result Display**: Show API responses in the plugin UI
4. **Error Handling**: Enhanced error handling for API calls

## Security

- Credentials are stored securely in Figma's clientStorage
- Tokens include expiration timestamps
- No external dependencies for HTTP requests (uses Figma's built-in fetch)
- Network access is restricted to StackSpot API domains only

## License

MIT
