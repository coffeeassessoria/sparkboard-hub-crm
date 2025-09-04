import { prisma } from '../lib/prisma'
import { Task, TaskStatus, TaskPriority } from '../types'

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  assignedTo?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string
}

export const tasksAPI = {
  async getAll(): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        include: {
          project: {
            include: {
              client: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      return []
    }
  },

  async getById(id: string): Promise<Task | null> {
    try {
      return await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error)
      return null
    }
  },

  async getByProjectId(projectId: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: { projectId },
        include: {
          project: {
            include: {
              client: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar tarefas do projeto:', error)
      return []
    }
  },

  async getByAssignee(assignedTo: string): Promise<Task[]> {
    try {
      return await prisma.task.findMany({
        where: { assignedTo },
        include: {
          project: {
            include: {
              client: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar tarefas do usuário:', error)
      return []
    }
  },

  async create(data: CreateTaskRequest): Promise<Task | null> {
    try {
      return await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          projectId: data.projectId,
          assignedTo: data.assignedTo,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate
        },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      return null
    }
  },

  async update(data: UpdateTaskRequest): Promise<Task | null> {
    try {
      const { id, ...updateData } = data
      return await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.task.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
      return false
    }
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    try {
      return await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          project: {
            include: {
              client: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error)
      return null
    }
  },

  async seedTasks(): Promise<void> {
    try {
      const taskCount = await prisma.task.count()
      if (taskCount > 0) {
        console.log('Tarefas já existem no banco')
        return
      }

      // Buscar projetos existentes
      const projects = await prisma.project.findMany()
      if (projects.length === 0) {
        console.log('Nenhum projeto encontrado para criar tarefas')
        return
      }

      // Buscar usuários existentes
      const users = await prisma.user.findMany()

      const defaultTasks = [
        {
          title: 'Análise de Requisitos',
          description: 'Levantar e documentar todos os requisitos do projeto',
          projectId: projects[0].id,
          assignedTo: users[1]?.id,
          status: TaskStatus.CONCLUIDA,
          priority: TaskPriority.ALTA,
          dueDate: new Date('2024-01-20')
        },
        {
          title: 'Design da Interface',
          description: 'Criar mockups e protótipos das telas principais',
          projectId: projects[0].id,
          assignedTo: users[2]?.id,
          status: TaskStatus.EM_ANDAMENTO,
          priority: TaskPriority.ALTA,
          dueDate: new Date('2024-02-15')
        },
        {
          title: 'Desenvolvimento Backend',
          description: 'Implementar APIs e lógica de negócio',
          projectId: projects[0].id,
          assignedTo: users[0]?.id,
          status: TaskStatus.PENDENTE,
          priority: TaskPriority.MEDIA,
          dueDate: new Date('2024-03-01')
        },
        {
          title: 'Testes de Integração',
          description: 'Executar testes de integração entre sistemas',
          projectId: projects[1]?.id || projects[0].id,
          assignedTo: users[1]?.id,
          status: TaskStatus.PENDENTE,
          priority: TaskPriority.BAIXA,
          dueDate: new Date('2024-05-15')
        }
      ]

      await prisma.task.createMany({
        data: defaultTasks
      })

      console.log('Tarefas padrão criadas com sucesso')
    } catch (error) {
      console.error('Erro ao criar tarefas padrão:', error)
    }
  }
}