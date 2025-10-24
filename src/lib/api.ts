// Servicio de API para comunicación con el backend
const API_BASE_URL = 'http://localhost:8080';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  isActive?: boolean;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderRequest {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phoneNumber?: string;
  email?: string;
}

export interface Provider {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourierRequest {
  organizationId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

export interface Courier {
  id: string;
  organizationId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Clase principal de API
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Para respuestas DELETE, no intentar parsear JSON si no hay contenido
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    // Verificar si hay contenido antes de parsear JSON
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      // Si no es JSON válido, devolver el texto como string
      return text as T;
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async register(userData: CreateUserRequest): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await this.request<{ valid: boolean; user?: User }>('/auth/validate', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      this.logout();
      return { valid: false };
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Métodos de organizaciones
  async getOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/organizations');
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    return this.request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`);
  }

  async updateOrganization(id: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string): Promise<void> {
    return this.request<void>(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos de usuarios
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos de clientes
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('/clients');
  }

  async createClient(data: CreateClientRequest): Promise<Client> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getClient(id: string): Promise<Client> {
    return this.request<Client>(`/clients/${id}`);
  }

  async updateClient(id: string, data: Partial<CreateClientRequest>): Promise<Client> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos de proveedores
  async getProviders(): Promise<Provider[]> {
    return this.request<Provider[]>('/providers');
  }

  async createProvider(data: CreateProviderRequest): Promise<Provider> {
    return this.request<Provider>('/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProvider(id: string): Promise<Provider> {
    return this.request<Provider>(`/providers/${id}`);
  }

  async updateProvider(id: string, data: Partial<CreateProviderRequest>): Promise<Provider> {
    return this.request<Provider>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProvider(id: string): Promise<void> {
    return this.request<void>(`/providers/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos de couriers
  async getCouriers(): Promise<Courier[]> {
    return this.request<Courier[]>('/couriers');
  }

  async createCourier(data: CreateCourierRequest): Promise<Courier> {
    return this.request<Courier>('/couriers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCourier(id: string): Promise<Courier> {
    return this.request<Courier>(`/couriers/${id}`);
  }

  async updateCourier(id: string, data: Partial<CreateCourierRequest>): Promise<Courier> {
    return this.request<Courier>(`/couriers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourier(id: string): Promise<void> {
    return this.request<void>(`/couriers/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos de tasks
  async getTasks(): Promise<any[]> {
    return this.request<any[]>('/tasks');
  }

  async createTask(data: any): Promise<any> {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTask(id: string): Promise<any> {
    return this.request<any>(`/tasks/${id}`);
  }

  async updateTask(id: string, data: any): Promise<any> {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTasksByOrganization(organizationId: string): Promise<any[]> {
    return this.request<any[]>(`/tasks/organization/${organizationId}`);
  }

  async getTasksByCourier(courierId: string): Promise<any[]> {
    return this.request<any[]>(`/tasks/courier/${courierId}`);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<any> {
    return this.request<any>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async uploadTaskPhoto(taskId: string, formData: FormData): Promise<{ photoUrl: string }> {
    return this.request<{ photoUrl: string }>(`/tasks/${taskId}/photo`, {
      method: 'POST',
      body: formData,
    });
  }
}

// Instancia singleton del servicio de API
export const apiService = new ApiService();
export default apiService;
