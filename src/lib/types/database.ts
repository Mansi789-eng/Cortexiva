export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bots: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          department: string;
          description: string | null;
          config: BotConfig;
          status: 'draft' | 'active' | 'paused';
          created_at: string;
          updated_at: string;
          slack_team_id: string | null;
          slack_team_name: string | null;
          slack_access_token: string | null;
          slack_channels: SlackChannel[];
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          department: string;
          description?: string | null;
          config?: BotConfig;
          status?: 'draft' | 'active' | 'paused';
          created_at?: string;
          updated_at?: string;
          slack_team_id?: string | null;
          slack_team_name?: string | null;
          slack_access_token?: string | null;
          slack_channels?: SlackChannel[];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          department?: string;
          description?: string | null;
          config?: BotConfig;
          status?: 'draft' | 'active' | 'paused';
          created_at?: string;
          updated_at?: string;
          slack_team_id?: string | null;
          slack_team_name?: string | null;
          slack_access_token?: string | null;
          slack_channels?: SlackChannel[];
        };
      };
      knowledge_sources: {
        Row: {
          id: string;
          bot_id: string;
          type: 'file' | 'url' | 'text' | 'slack';
          name: string;
          file_path: string | null;
          url: string | null;
          content: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          metadata: Json;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          type: 'file' | 'url' | 'text' | 'slack';
          name: string;
          file_path?: string | null;
          url?: string | null;
          content?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          metadata?: Json;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          type?: 'file' | 'url' | 'text' | 'slack';
          name?: string;
          file_path?: string | null;
          url?: string | null;
          content?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          metadata?: Json;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      embeddings: {
        Row: {
          id: string;
          source_id: string;
          bot_id: string;
          content: string;
          embedding: number[];
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          bot_id: string;
          content: string;
          embedding: number[];
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          bot_id?: string;
          content?: string;
          embedding?: number[];
          metadata?: Json;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          bot_id: string;
          user_id: string | null;
          session_id: string;
          messages: ChatMessage[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bot_id: string;
          user_id?: string | null;
          session_id: string;
          messages?: ChatMessage[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bot_id?: string;
          user_id?: string | null;
          session_id?: string;
          messages?: ChatMessage[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Bot configuration type
export interface BotConfig {
  systemPrompt: string;
  tone: 'professional' | 'friendly' | 'casual' | 'concise';
  welcomeMessage: string;
  confidenceThreshold: number;
  fallbackMessage: string;
  enableFollowUp: boolean;
  suggestRelated: boolean;
  temperature: number;
  maxTokens: number;
  memorySize: number;
  visibility: 'public' | 'private' | 'domain';
  allowedDomain: string;
}

// Source info with timestamp
export interface SourceInfo {
  name: string;
  updatedAt: string;
}

// Chat message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceInfo[];
}

// Slack channel type
export interface SlackChannel {
  id: string;
  name: string;
  synced_at: string | null;
  message_count: number;
}

// Default bot config
export const defaultBotConfig: BotConfig = {
  systemPrompt: '',
  tone: 'professional',
  welcomeMessage: 'Hello! How can I help you today?',
  confidenceThreshold: 70,
  fallbackMessage: "I'm not sure about that. Let me connect you with someone who can help.",
  enableFollowUp: true,
  suggestRelated: true,
  temperature: 0.7,
  maxTokens: 500,
  memorySize: 5,
  visibility: 'private',
  allowedDomain: '',
};
