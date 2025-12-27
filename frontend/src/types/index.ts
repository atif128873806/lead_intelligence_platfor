// Type definitions for Lead Intelligence Platform

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  is_active: boolean;
  leads_assigned: number;
  leads_contacted: number;
  deals_closed: number;
  revenue_generated: number;
  created_at: string;
  last_login?: string;
}

export interface Lead {
  id: number;
  unique_fingerprint: string;
  business_name: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  maps_url: string;
  category?: string;
  search_query: string;
  
  // AI Scoring
  ai_score: number;
  priority?: 'A' | 'B' | 'C';
  conversion_probability?: number;
  revenue_potential?: string;
  recommended_action?: string;
  
  // Metadata
  data_quality_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  assigned_to_user_id?: number;
  campaign_id?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
  
  // Notes
  notes?: string;
  tags?: string[];
}

export interface Campaign {
  id: number;
  name: string;
  search_query: string;
  status: 'active' | 'paused' | 'completed';
  
  // Stats
  total_leads: number;
  new_leads: number;
  duplicate_leads: number;
  hot_leads: number;
  
  // Timestamps
  created_at: string;
  completed_at?: string;
  
  // Settings
  settings?: Record<string, any>;
}

export interface DashboardStats {
  total_leads: number;
  new_today: number;
  hot_leads: number;
  conversion_rate: number;
  revenue_potential: string;
  active_campaigns: number;
  avg_quality_score: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface LeadFilters {
  priority?: 'A' | 'B' | 'C';
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface CreateLeadData {
  business_name: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  rating?: number;
  reviews_count?: number;
  maps_url: string;
  category?: string;
  search_query: string;
}

export interface UpdateLeadData {
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  status?: string;
  notes?: string;
  tags?: string[];
}

export interface CreateCampaignData {
  name: string;
  search_query: string;
  settings?: Record<string, any>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export interface ApiError {
  detail: string;
}

// Utility types
export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  field: string;
  direction: SortDirection;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
