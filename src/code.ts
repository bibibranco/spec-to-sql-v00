// Figma Plugin API types are provided by @figma/plugin-typings

// Types for authentication and storage
interface AuthCredentials {
  client_id: string;
  client_secret: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface StoredAuth {
  access_token: string;
  expires_at: number;
}

interface UIMessage {
  type: 'AUTHENTICATE' | 'AUTH_SUCCESS' | 'AUTH_ERROR' | 'SHOW_UI' | 'HIDE_UI';
  data?: any;
}

// Constants
const STORAGE_KEYS = {
  CREDENTIALS: 'stackspot_credentials',
  AUTH: 'stackspot_auth'
} as const;

const API_ENDPOINTS = {
  AUTH: 'https://api.stackspot.com/oauth/token'
} as const;

class StackSpotPlugin {
  private ui: UIPostMessageAPI | null = null;

  constructor() {
    this.initializePlugin();
  }

  private async initializePlugin(): Promise<void> {
    try {
      // Check if we have stored credentials
      const credentials = await this.getStoredCredentials();
      
      if (!credentials) {
        // No credentials stored, show UI for input
        this.showUI();
        return;
      }

      // Check if we have valid stored auth
      const auth = await this.getStoredAuth();
      if (auth && this.isTokenValid(auth)) {
        // We have valid authentication, proceed to main functionality
        this.onAuthenticationSuccess();
        return;
      }

      // Try to authenticate with stored credentials
      const authResult = await this.authenticate(credentials);
      if (authResult.success) {
        await this.storeAuth(authResult.data!);
        this.onAuthenticationSuccess();
      } else {
        // Authentication failed, show UI for new credentials
        this.showUI();
      }
    } catch (error) {
      console.error('Plugin initialization error:', error);
      this.showUI();
    }
  }

  private async getStoredCredentials(): Promise<AuthCredentials | null> {
    try {
      const stored = await figma.clientStorage.getAsync(STORAGE_KEYS.CREDENTIALS);
      return stored as AuthCredentials | null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  }

  private async getStoredAuth(): Promise<StoredAuth | null> {
    try {
      const stored = await figma.clientStorage.getAsync(STORAGE_KEYS.AUTH);
      return stored as StoredAuth | null;
    } catch (error) {
      console.error('Error getting stored auth:', error);
      return null;
    }
  }

  private async storeCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      await figma.clientStorage.setAsync(STORAGE_KEYS.CREDENTIALS, credentials);
    } catch (error) {
      console.error('Error storing credentials:', error);
      throw error;
    }
  }

  private async storeAuth(authData: AuthResponse): Promise<void> {
    try {
      const expiresAt = Date.now() + (authData.expires_in * 1000);
      const storedAuth: StoredAuth = {
        access_token: authData.access_token,
        expires_at: expiresAt
      };
      await figma.clientStorage.setAsync(STORAGE_KEYS.AUTH, storedAuth);
    } catch (error) {
      console.error('Error storing auth:', error);
      throw error;
    }
  }

  private isTokenValid(auth: StoredAuth): boolean {
    const now = Date.now();
    return auth.expires_at > now + 60000; // 1 minute buffer
  }

  private async authenticate(credentials: AuthCredentials): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: credentials.client_id,
          client_secret: credentials.client_secret
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Authentication failed: ${response.status} ${errorText}`
        };
      }

      const authData: AuthResponse = await response.json();
      return {
        success: true,
        data: authData
      };
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private showUI(): void {
    if (!this.ui) {
      this.ui = figma.showUI(__html__, {
        width: 400,
        height: 300,
        themeColors: true
      });

      this.ui.onmessage = this.handleUIMessage.bind(this);
    }
  }

  private hideUI(): void {
    if (this.ui) {
      this.ui.close();
      this.ui = null;
    }
  }

  private async handleUIMessage(message: UIMessage): Promise<void> {
    switch (message.type) {
      case 'AUTHENTICATE':
        await this.handleAuthentication(message.data);
        break;
      case 'HIDE_UI':
        this.hideUI();
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleAuthentication(credentials: AuthCredentials): Promise<void> {
    try {
      // Store credentials
      await this.storeCredentials(credentials);

      // Attempt authentication
      const authResult = await this.authenticate(credentials);
      
      if (authResult.success) {
        await this.storeAuth(authResult.data!);
        this.ui?.postMessage({
          type: 'AUTH_SUCCESS',
          data: { message: 'Authentication successful!' }
        });
        
        // Hide UI after a short delay
        setTimeout(() => {
          this.hideUI();
          this.onAuthenticationSuccess();
        }, 1500);
      } else {
        this.ui?.postMessage({
          type: 'AUTH_ERROR',
          data: { error: authResult.error }
        });
      }
    } catch (error) {
      this.ui?.postMessage({
        type: 'AUTH_ERROR',
        data: { error: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}` }
      });
    }
  }

  private onAuthenticationSuccess(): void {
    console.log('Authentication successful! Ready for next steps...');
    
    // TODO: Next step - query nodes with "tagueamento" and send to StackSpot Quick Command API
    // This is where we'll implement the main functionality
    
    // For now, just show a success message
    figma.notify('StackSpot plugin authenticated successfully!', { timeout: 3000 });
  }
}

// Initialize the plugin
new StackSpotPlugin();
