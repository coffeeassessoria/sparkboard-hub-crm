import { prisma } from '../lib/prisma'
import { Project, ProjectStatus } from '../types'

export interface CreateProjectRequest {
  name: string
  description?: string
  clientId: string
  startDate: Date
  endDate?: Date
  budget?: number
  status: ProjectStatus
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string
}

export const projectsAPI = {
  async getAll(): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        include: {
          client: true,
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
      return []
    }
  },

  async getById(id: string): Promise<Project | null> {
    try {
      return await prisma.project.findUnique({
        where: { id },
        include: {
          client: true,
          tasks: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      return null
    }
  },

  async getByClientId(clientId: string): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: { clientId },
        include: {
          client: true,
          tasks: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar projetos do cliente:', error)
      return []
    }
  },

  async create(data: CreateProjectRequest): Promise<Project | null> {
    try {
      return await prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          clientId: data.clientId,
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          status: data.status
        },
        include: {
          client: true
        }
      })
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      return null
    }
  },

  async update(data: UpdateProjectRequest): Promise<Project | null> {
    try {
      const { id, ...updateData } = data
      return await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          tasks: true
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      // Primeiro deletar todas as tarefas relacionadas
      await prisma.task.deleteMany({
        where: { projectId: id }
      })
      
      // Depois deletar o projeto
      await prisma.project.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      return false
    }
  },

  async seedProjects(): Promise<void> {
    try {
      const projectCount = await prisma.project.count()
      if (projectCount > 0) {
        console.log('Projetos já existem no banco')
        return
      }

      // Buscar clientes existentes
      const clients = await prisma.client.findMany()
      if (clients.length === 0) {
        console.log('Nenhum cliente encontrado para criar projetos')
        return
      }

      const defaultProjects = [
        {
          name: 'Website Corporativo',
          description: 'Desenvolvimento de website institucional responsivo',
          clientId: clients[0].id,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          budget: 15000,
          status: ProjectStatus.EM_ANDAMENTO
        },
        {
          name: 'Sistema de Gestão',
          description: 'Sistema web para gestão interna da empresa',
          clientId: clients[1]?.id || clients[0].id,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-06-01'),
          budget: 45000,
          status: ProjectStatus.PLANEJAMENTO
        },
        {
          name: 'App Mobile',
          description: 'Aplicativo mobile para iOS e Android',
          clientId: clients[2]?.id || clients[0].id,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-28'),
          budget: 25000,
          status: ProjectStatus.CONCLUIDO
        }
      ]

      await prisma.project.createMany({
        data: defaultProjects
      })

      console.log('Projetos padrão criados com sucesso')
    } catch (error) {
      console.error('Erro ao criar projetos padrão:', error)
    }
  }
}