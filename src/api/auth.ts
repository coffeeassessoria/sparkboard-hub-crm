import { prisma } from '../lib/prisma'
import { UserRole } from '../types'

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

// Simulação de hash de senha (em produção, use bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password) // Base64 simples para demonstração
}

const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash
}

export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        }
      }

      if (!verifyPassword(credentials.password, user.password)) {
        return {
          success: false,
          message: 'Senha incorreta'
        }
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        return {
          success: false,
          message: 'Email já está em uso'
        }
      }

      // Criar novo usuário
      const hashedPassword = hashPassword(userData.password)
      const newUser = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        }
      })

      return {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return {
        success: false,
        message: 'Erro interno do servidor'
      }
    }
  },

  async seedUsers(): Promise<void> {
    try {
      // Verificar se já existem usuários
      const userCount = await prisma.user.count()
      if (userCount > 0) {
        console.log('Usuários já existem no banco')
        return
      }

      // Criar usuários padrão
      const defaultUsers = [
        {
          name: 'Administrador',
          email: 'admin@sparkboard.com',
          password: hashPassword('admin123'),
          role: UserRole.ADM
        },
        {
          name: 'Gestor Silva',
          email: 'gestor@sparkboard.com',
          password: hashPassword('gestor123'),
          role: UserRole.GESTOR
        },
        {
          name: 'Operador Santos',
          email: 'operador@sparkboard.com',
          password: hashPassword('operador123'),
          role: UserRole.OPERACIONAL
        }
      ]

      await prisma.user.createMany({
        data: defaultUsers
      })

      console.log('Usuários padrão criados com sucesso')
    } catch (error) {
      console.error('Erro ao criar usuários padrão:', error)
    }
  }
}