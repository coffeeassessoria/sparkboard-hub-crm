import { prisma } from '../lib/prisma'
import { Client } from '../types'

export interface CreateClientRequest {
  name: string
  email: string
  phone: string
  company?: string
  address?: string
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string
}

export const clientsAPI = {
  async getAll(): Promise<Client[]> {
    try {
      return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      return await prisma.client.findUnique({
        where: { id },
        include: {
          projects: true
        }
      })
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
      return null
    }
  },

  async create(data: CreateClientRequest): Promise<Client | null> {
    try {
      return await prisma.client.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          address: data.address
        }
      })
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      return null
    }
  },

  async update(data: UpdateClientRequest): Promise<Client | null> {
    try {
      const { id, ...updateData } = data
      return await prisma.client.update({
        where: { id },
        data: updateData
      })
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.client.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      return false
    }
  },

  async seedClients(): Promise<void> {
    try {
      const clientCount = await prisma.client.count()
      if (clientCount > 0) {
        console.log('Clientes já existem no banco')
        return
      }

      const defaultClients = [
        {
          name: 'João Silva',
          email: 'joao@empresa.com',
          phone: '(11) 99999-9999',
          company: 'Empresa ABC Ltda',
          address: 'Rua das Flores, 123 - São Paulo, SP'
        },
        {
          name: 'Maria Santos',
          email: 'maria@startup.com',
          phone: '(21) 88888-8888',
          company: 'Startup XYZ',
          address: 'Av. Copacabana, 456 - Rio de Janeiro, RJ'
        },
        {
          name: 'Pedro Costa',
          email: 'pedro@tech.com',
          phone: '(31) 77777-7777',
          company: 'Tech Solutions',
          address: 'Rua da Tecnologia, 789 - Belo Horizonte, MG'
        }
      ]

      await prisma.client.createMany({
        data: defaultClients
      })

      console.log('Clientes padrão criados com sucesso')
    } catch (error) {
      console.error('Erro ao criar clientes padrão:', error)
    }
  }
}