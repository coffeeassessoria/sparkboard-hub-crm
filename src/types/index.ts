// Frontend types - separate from Prisma to avoid browser compatibility issues

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER'
}

export enum Department {
  OPERACIONAL = 'OPERACIONAL',
  COMERCIAL = 'COMERCIAL',
  FINANCEIRO = 'FINANCEIRO',
  ADMINISTRATIVO = 'ADMINISTRATIVO'
}

export enum OperationalRole {
  DESIGNER = 'DESIGNER',
  EDITOR_VIDEO = 'EDITOR_VIDEO',
  GESTOR_PROJETOS = 'GESTOR_PROJETOS',
  DESENVOLVEDOR = 'DESENVOLVEDOR',
  ANALISTA_QUALIDADE = 'ANALISTA_QUALIDADE'
}

export enum CommercialRole {
  SDR = 'SDR',
  BDR = 'BDR',
  CLOSER = 'CLOSER',
  GESTOR_COMERCIAL = 'GESTOR_COMERCIAL',
  ACCOUNT_MANAGER = 'ACCOUNT_MANAGER'
}

export enum FinancialRole {
  ANALISTA_FINANCEIRO = 'ANALISTA_FINANCEIRO',
  CONTROLLER = 'CONTROLLER',
  GESTOR_FINANCEIRO = 'GESTOR_FINANCEIRO'
}

export enum AdministrativeRole {
  ASSISTENTE_ADMIN = 'ASSISTENTE_ADMIN',
  COORDENADOR_RH = 'COORDENADOR_RH',
  GESTOR_ADMIN = 'GESTOR_ADMIN'
}

export type SpecificRole = OperationalRole | CommercialRole | FinancialRole | AdministrativeRole;

export enum DealStatus {
  LEAD = 'LEAD',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: DealStatus;
  clientId: string;
  assignedToId?: string;
  expectedCloseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId?: string;
  projectId?: string;
  dealId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId?: string;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  tasks?: Task[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: Department;
  specificRole?: SpecificRole;
  avatar?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}