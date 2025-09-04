// Frontend API service - makes HTTP calls to backend endpoints
import { 
  Client, Deal, Task, Project, User, 
  DealStatus, TaskStatus, TaskPriority, ProjectStatus, UserRole 
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Helper function for API calls
const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

// Auth API
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
  }
  message?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: UserRole
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return apiCall<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async logout(): Promise<{ success: boolean }> {
    return apiCall<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    })
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiCall<User>('/auth/me')
    } catch {
      return null
    }
  },
}

// Clients API
export interface CreateClientRequest {
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  notes?: string
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export const clientsAPI = {
  async getAll(): Promise<Client[]> {
    return apiCall<Client[]>('/clients')
  },

  async getById(id: string): Promise<Client> {
    return apiCall<Client>(`/clients/${id}`)
  },

  async create(data: CreateClientRequest): Promise<Client> {
    return apiCall<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: UpdateClientRequest): Promise<Client> {
    return apiCall<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/clients/${id}`, {
      method: 'DELETE',
    })
  },
}

// Deals API
export interface CreateDealRequest {
  title: string
  description?: string
  value: number
  status: DealStatus
  clientId: string
  assignedToId?: string
  expectedCloseDate?: string
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {}

export const dealsAPI = {
  async getAll(): Promise<Deal[]> {
    return apiCall<Deal[]>('/deals')
  },

  async getById(id: string): Promise<Deal> {
    return apiCall<Deal>(`/deals/${id}`)
  },

  async create(data: CreateDealRequest): Promise<Deal> {
    return apiCall<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: UpdateDealRequest): Promise<Deal> {
    return apiCall<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/deals/${id}`, {
      method: 'DELETE',
    })
  },
}

// Tasks API
export interface CreateTaskRequest {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedToId?: string
  projectId?: string
  dealId?: string
  dueDate?: string
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

export const tasksAPI = {
  async getAll(): Promise<Task[]> {
    return apiCall<Task[]>('/tasks')
  },

  async getById(id: string): Promise<Task> {
    return apiCall<Task>(`/tasks/${id}`)
  },

  async create(data: CreateTaskRequest): Promise<Task> {
    return apiCall<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    return apiCall<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },
}

// Projects API
export interface CreateProjectRequest {
  name: string
  description?: string
  status: ProjectStatus
  clientId?: string
  managerId?: string
  startDate?: string
  endDate?: string
  budget?: number
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export const projectsAPI = {
  async getAll(): Promise<Project[]> {
    return apiCall<Project[]>('/projects')
  },

  async getById(id: string): Promise<Project> {
    return apiCall<Project>(`/projects/${id}`)
  },

  async create(data: CreateProjectRequest): Promise<Project> {
    return apiCall<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    return apiCall<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    await apiCall<void>(`/projects/${id}`, {
      method: 'DELETE',
    })
  },
}