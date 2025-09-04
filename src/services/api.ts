// Frontend API service - uses mock APIs for demo purposes
import { 
  mockAuthAPI, 
  mockClientsAPI,
  mockDealsAPI,
  mockTasksAPI,
  mockProjectsAPI,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CreateClientRequest,
  UpdateClientRequest,
  CreateDealRequest,
  UpdateDealRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest
} from './mockApi'

// Re-export types and APIs
export type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  CreateClientRequest, 
  UpdateClientRequest,
  CreateDealRequest,
  UpdateDealRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest
}

export const authAPI = mockAuthAPI
export const clientsAPI = mockClientsAPI
export const dealsAPI = mockDealsAPI
export const tasksAPI = mockTasksAPI
export const projectsAPI = mockProjectsAPI