// Mock API service for development/demo purposes
// This simulates backend functionality using localStorage

import { 
  Client, Deal, Task, Project, User, 
  DealStatus, TaskStatus, TaskPriority, ProjectStatus, UserRole 
} from '../types'

// Mock data storage keys
const STORAGE_KEYS = {
  users: 'crm_users',
  clients: 'crm_clients',
  deals: 'crm_deals',
  tasks: 'crm_tasks',
  projects: 'crm_projects',
  currentUser: 'crm_current_user'
}

// Initialize mock data
const initializeMockData = () => {
  // Create default admin user if not exists
  const users = getStorageData<User[]>(STORAGE_KEYS.users, [])
  if (users.length === 0) {
    const defaultUser: User = {
      id: '1',
      name: 'Admin User',
      email: 'admin@crm.com',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    users.push(defaultUser)
    setStorageData(STORAGE_KEYS.users, users)
  }

  // Initialize empty arrays for other entities
  getStorageData<Client[]>(STORAGE_KEYS.clients, [])
  getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
  getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
  getStorageData<Project[]>(STORAGE_KEYS.projects, [])
}

// Helper functions
const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStorageData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data))
}

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

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

export const mockAuthAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    await delay()
    initializeMockData()
    
    const users = getStorageData<User[]>(STORAGE_KEYS.users, [])
    const user = users.find(u => u.email === data.email)
    
    if (user && data.password === 'admin123') { // Simple password check
      setStorageData(STORAGE_KEYS.currentUser, user)
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }
    
    return {
      success: false,
      message: 'Invalid credentials'
    }
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    await delay()
    initializeMockData()
    
    const users = getStorageData<User[]>(STORAGE_KEYS.users, [])
    
    if (users.find(u => u.email === data.email)) {
      return {
        success: false,
        message: 'Email already exists'
      }
    }
    
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    users.push(newUser)
    setStorageData(STORAGE_KEYS.users, users)
    setStorageData(STORAGE_KEYS.currentUser, newUser)
    
    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    await delay(100)
    localStorage.removeItem(STORAGE_KEYS.currentUser)
    return { success: true }
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay(100)
    return getStorageData<User | null>(STORAGE_KEYS.currentUser, null)
  }
}

// Clients API
export interface CreateClientRequest {
  name: string
  email: string
  phone?: string
  company?: string
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string
}

export const mockClientsAPI = {
  getAll: async (): Promise<Client[]> => {
    await delay()
    return getStorageData<Client[]>(STORAGE_KEYS.clients, [])
  },

  getById: async (id: string): Promise<Client | null> => {
    await delay()
    const clients = getStorageData<Client[]>(STORAGE_KEYS.clients, [])
    return clients.find(c => c.id === id) || null
  },

  create: async (data: CreateClientRequest): Promise<Client> => {
    await delay()
    const clients = getStorageData<Client[]>(STORAGE_KEYS.clients, [])
    
    const newClient: Client = {
      id: generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    clients.push(newClient)
    setStorageData(STORAGE_KEYS.clients, clients)
    return newClient
  },

  update: async (data: UpdateClientRequest): Promise<Client> => {
    await delay()
    const clients = getStorageData<Client[]>(STORAGE_KEYS.clients, [])
    const index = clients.findIndex(c => c.id === data.id)
    
    if (index === -1) {
      throw new Error('Client not found')
    }
    
    clients[index] = {
      ...clients[index],
      ...data,
      updatedAt: new Date()
    }
    
    setStorageData(STORAGE_KEYS.clients, clients)
    return clients[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const clients = getStorageData<Client[]>(STORAGE_KEYS.clients, [])
    const filtered = clients.filter(c => c.id !== id)
    setStorageData(STORAGE_KEYS.clients, filtered)
  }
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

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  id: string
}

export const mockDealsAPI = {
  getAll: async (): Promise<Deal[]> => {
    await delay()
    return getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
  },

  getById: async (id: string): Promise<Deal | null> => {
    await delay()
    const deals = getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
    return deals.find(d => d.id === id) || null
  },

  create: async (data: CreateDealRequest): Promise<Deal> => {
    await delay()
    const deals = getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
    
    const newDeal: Deal = {
      id: generateId(),
      title: data.title,
      description: data.description,
      value: data.value,
      status: data.status,
      clientId: data.clientId,
      assignedToId: data.assignedToId,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    deals.push(newDeal)
    setStorageData(STORAGE_KEYS.deals, deals)
    return newDeal
  },

  update: async (data: UpdateDealRequest): Promise<Deal> => {
    await delay()
    const deals = getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
    const index = deals.findIndex(d => d.id === data.id)
    
    if (index === -1) {
      throw new Error('Deal not found')
    }
    
    deals[index] = {
      ...deals[index],
      ...data,
      updatedAt: new Date()
    }
    
    setStorageData(STORAGE_KEYS.deals, deals)
    return deals[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const deals = getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
    const filtered = deals.filter(d => d.id !== id)
    setStorageData(STORAGE_KEYS.deals, filtered)
  },

  getStatistics: async () => {
    await delay()
    const deals = getStorageData<Deal[]>(STORAGE_KEYS.deals, [])
    
    const total = deals.length
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    
    const byStatus = {
      LEAD: { count: 0, value: 0 },
      QUALIFIED: { count: 0, value: 0 },
      PROPOSAL: { count: 0, value: 0 },
      NEGOTIATION: { count: 0, value: 0 },
      CLOSED_WON: { count: 0, value: 0 },
      CLOSED_LOST: { count: 0, value: 0 }
    }
    
    deals.forEach(deal => {
      if (byStatus[deal.status]) {
        byStatus[deal.status].count++
        byStatus[deal.status].value += deal.value
      }
    })
    
    return {
      total,
      totalValue,
      byStatus
    }
  }
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

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
}

export const mockTasksAPI = {
  getAll: async (): Promise<Task[]> => {
    await delay()
    return getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
  },

  getById: async (id: string): Promise<Task | null> => {
    await delay()
    const tasks = getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
    return tasks.find(t => t.id === id) || null
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    await delay()
    const tasks = getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
    
    const newTask: Task = {
      id: generateId(),
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedToId: data.assignedToId,
      projectId: data.projectId,
      dealId: data.dealId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    tasks.push(newTask)
    setStorageData(STORAGE_KEYS.tasks, tasks)
    return newTask
  },

  update: async (data: UpdateTaskRequest): Promise<Task> => {
    await delay()
    const tasks = getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
    const index = tasks.findIndex(t => t.id === data.id)
    
    if (index === -1) {
      throw new Error('Task not found')
    }
    
    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: new Date()
    }
    
    setStorageData(STORAGE_KEYS.tasks, tasks)
    return tasks[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const tasks = getStorageData<Task[]>(STORAGE_KEYS.tasks, [])
    const filtered = tasks.filter(t => t.id !== id)
    setStorageData(STORAGE_KEYS.tasks, filtered)
  }
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

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string
}

export const mockProjectsAPI = {
  getAll: async (): Promise<Project[]> => {
    await delay()
    return getStorageData<Project[]>(STORAGE_KEYS.projects, [])
  },

  getById: async (id: string): Promise<Project | null> => {
    await delay()
    const projects = getStorageData<Project[]>(STORAGE_KEYS.projects, [])
    return projects.find(p => p.id === id) || null
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    await delay()
    const projects = getStorageData<Project[]>(STORAGE_KEYS.projects, [])
    
    const newProject: Project = {
      id: generateId(),
      name: data.name,
      description: data.description,
      status: data.status,
      clientId: data.clientId,
      managerId: data.managerId,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      budget: data.budget,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    projects.push(newProject)
    setStorageData(STORAGE_KEYS.projects, projects)
    return newProject
  },

  update: async (data: UpdateProjectRequest): Promise<Project> => {
    await delay()
    const projects = getStorageData<Project[]>(STORAGE_KEYS.projects, [])
    const index = projects.findIndex(p => p.id === data.id)
    
    if (index === -1) {
      throw new Error('Project not found')
    }
    
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date()
    }
    
    setStorageData(STORAGE_KEYS.projects, projects)
    return projects[index]
  },

  delete: async (id: string): Promise<void> => {
    await delay()
    const projects = getStorageData<Project[]>(STORAGE_KEYS.projects, [])
    const filtered = projects.filter(p => p.id !== id)
    setStorageData(STORAGE_KEYS.projects, filtered)
  }
}

// Initialize mock data on module load
initializeMockData()