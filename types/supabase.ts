// export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
// export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
export type SupabaseChat = Database['public']['Tables']['chats']['Row']
export type DocumentOwner =
  Database['public']['Tables']['document_owners']['Row']
export type DocumentSection =
  Database['public']['Tables']['document_sections']['Row']
export type SupabaseDocument = Database['public']['Tables']['documents']['Row']
export type SupabaseTag = Database['public']['Tables']['tags']['Row']
export type SupabaseAgent = Database['public']['Tables']['agents']['Row']
export type SupabaseProfile = Database['public']['Tables']['profiles']['Row']
export type SupabaseOrganization =
  Database['public']['Tables']['organizations']['Row']

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          description: string | null
          functions: Json | null
          id: number
          model: string | null
          name: string
          prompt: string | null
          tags: Json | null
          temperature: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          functions?: Json | null
          id?: number
          model?: string | null
          name: string
          prompt?: string | null
          tags?: Json | null
          temperature?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          functions?: Json | null
          id?: number
          model?: string | null
          name?: string
          prompt?: string | null
          tags?: Json | null
          temperature?: number | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'chats_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      document_owners: {
        Row: {
          document_id: number
          id: number
          owner_id: string
        }
        Insert: {
          document_id: number
          id?: never
          owner_id?: string
        }
        Update: {
          document_id?: number
          id?: never
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'public_document_owners_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_document_owners_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      document_sections: {
        Row: {
          content: string
          document_id: number
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          document_id: number
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Update: {
          content?: string
          document_id?: number
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'public_document_sections_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          }
        ]
      }
      documents: {
        Row: {
          created_at: string
          id: number
          metadata: Json | null
          name: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          metadata?: Json | null
          name: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          metadata?: Json | null
          name?: string
          source?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          name: string
          text_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          text_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          text_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string | null
          organization_id: number | null
          settings: Json | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean
          name?: string | null
          organization_id?: number | null
          settings?: Json | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
          organization_id?: number | null
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profiles_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          group: string | null
          id: number
          name: string
          value: string
        }
        Insert: {
          color: string
          created_at?: string
          group?: string | null
          id?: number
          name: string
          value: string
        }
        Update: {
          color?: string
          created_at?: string
          group?: string | null
          id?: number
          name?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents_new: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter?: Json
          tags?: string[]
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
