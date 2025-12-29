// API Service for Lead Intelligence Platform
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Lead,
  Campaign,
  DashboardStats,
  LeadFilters,
  CreateLeadData,
  UpdateLeadData,
  CreateCampaignData,
  AuthResponse,
  LoginData,
  RegisterData,
  ApiError,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';



class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTH API ====================
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  // ==================== LEADS API ====================
  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    const response = await this.client.get<Lead[]>('/leads', { params: filters });
    return response.data;
  }

  async getLead(id: number): Promise<Lead> {
    const response = await this.client.get<Lead>(`/leads/${id}`);
    return response.data;
  }

  async createLead(data: CreateLeadData): Promise<Lead> {
    const response = await this.client.post<Lead>('/leads', data);
    return response.data;
  }

  async updateLead(id: number, data: UpdateLeadData): Promise<Lead> {
    const response = await this.client.put<Lead>(`/leads/${id}`, data);
    return response.data;
  }

  async deleteLead(id: number): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/leads/${id}`);
    return response.data;
  }

  // ==================== CAMPAIGNS API ====================// ==================== CAMPAIGNS ====================

async getCampaigns() {
  const response = await this.client.get('/campaigns');
  return response.data;
}

async getCampaign(id: number) {
  const response = await this.client.get(`/campaigns/${id}`);
  return response.data;
}

async createCampaign(data: CreateCampaignData) {
  const response = await this.client.post('/campaigns', data);
  return response.data;
}

async updateCampaign(id: number, data: Partial<Campaign>) {
  const response = await this.client.put(`/campaigns/${id}`, data);
  return response.data;
}

async deleteCampaign(id: number) {
  const response = await this.client.delete(`/campaigns/${id}`);
  return response.data;
}

  // ==================== DASHBOARD API ====================
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  async getLeadsByPriority(): Promise<Array<{ priority: string; count: number }>> {
    const response = await this.client.get<Array<{ priority: string; count: number }>>(
      '/dashboard/charts/leads-by-priority'
    );
    return response.data;
  }

  async getLeadsTimeline(days = 30): Promise<Array<{ date: string; count: number }>> {
    const response = await this.client.get<Array<{ date: string; count: number }>>(
      '/dashboard/charts/leads-timeline',
      { params: { days } }
    );
    return response.data;
  }

  async getQualityDistribution(): Promise<Array<{ range: string; count: number }>> {
    const response = await this.client.get<Array<{ range: string; count: number }>>(
      '/dashboard/charts/quality-distribution'
    );
    return response.data;
  }
}

// Export singleton instance
export const api = new APIService();
export default api;
