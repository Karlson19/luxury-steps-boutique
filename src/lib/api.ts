import { Product } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  meta?: {
    timestamp: string;
    duration: string;
    filters?: Record<string, string | number | boolean>;
  };
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    return process.env.NEXT_PUBLIC_SITE_URL || 
           process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
           'http://localhost:3000';
  }

  private async fetchWithRetry<T>(
    url: string, 
    options: RequestInit = {},
    retries = 3
  ): Promise<ApiResponse<T>> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Luxury-Steps-Boutique-App/1.0',
            ...options.headers,
          },
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'API returned error');
        }

        return data;

      } catch (error) {
        console.warn(`Attempt ${i + 1}/${retries + 1} failed:`, error);
        
        if (i === retries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  async getProducts(filters?: {
    featured?: boolean;
    category?: string;
    limit?: number;
    search?: string;
    inStock?: boolean;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.featured) params.append('featured', 'true');
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.inStock) params.append('inStock', 'true');

      const url = `${this.baseUrl}/api/products?${params.toString()}`;
      const response = await this.fetchWithRetry<Product[]>(url, { cache: 'no-store' });
      
      return response.data;
      
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.getProducts({ featured: true, limit, inStock: true });
  }

  async getAllProducts(): Promise<Product[]> {
    return this.getProducts({ limit: 100 });
  }
}

export const apiClient = new ApiClient();
