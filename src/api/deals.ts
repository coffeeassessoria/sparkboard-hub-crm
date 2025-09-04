import { prisma } from '../lib/prisma'
import { Deal, DealStatus } from '../types'

export interface CreateDealRequest {
  title: string
  description?: string
  clientId: string
  value: number
  status: DealStatus
  expectedCloseDate?: Date
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  id: string
}

export const dealsAPI = {
  async getAll(): Promise<Deal[]> {
    try {
      return await prisma.deal.findMany({
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar deals:', error)
      return []
    }
  },

  async getById(id: string): Promise<Deal | null> {
    try {
      return await prisma.deal.findUnique({
        where: { id },
        include: {
          client: true
        }
      })
    } catch (error) {
      console.error('Erro ao buscar deal:', error)
      return null
    }
  },

  async getByClientId(clientId: string): Promise<Deal[]> {
    try {
      return await prisma.deal.findMany({
        where: { clientId },
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar deals do cliente:', error)
      return []
    }
  },

  async getByStatus(status: DealStatus): Promise<Deal[]> {
    try {
      return await prisma.deal.findMany({
        where: { status },
        include: {
          client: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erro ao buscar deals por status:', error)
      return []
    }
  },

  async create(data: CreateDealRequest): Promise<Deal | null> {
    try {
      return await prisma.deal.create({
        data: {
          title: data.title,
          description: data.description,
          clientId: data.clientId,
          value: data.value,
          status: data.status,
          expectedCloseDate: data.expectedCloseDate
        },
        include: {
          client: true
        }
      })
    } catch (error) {
      console.error('Erro ao criar deal:', error)
      return null
    }
  },

  async update(data: UpdateDealRequest): Promise<Deal | null> {
    try {
      const { id, ...updateData } = data
      return await prisma.deal.update({
        where: { id },
        data: updateData,
        include: {
          client: true
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar deal:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.deal.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Erro ao deletar deal:', error)
      return false
    }
  },

  async updateStatus(id: string, status: DealStatus): Promise<Deal | null> {
    try {
      return await prisma.deal.update({
        where: { id },
        data: { status },
        include: {
          client: true
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar status do deal:', error)
      return null
    }
  },

  async getStatistics(): Promise<{
    total: number
    totalValue: number
    byStatus: Record<DealStatus, { count: number; value: number }>
  }> {
    try {
      const deals = await prisma.deal.findMany()
      
      const stats = {
        total: deals.length,
        totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
        byStatus: {
          LEAD: { count: 0, value: 0 },
          QUALIFICADO: { count: 0, value: 0 },
          PROPOSTA: { count: 0, value: 0 },
          NEGOCIACAO: { count: 0, value: 0 },
          FECHADO: { count: 0, value: 0 },
          PERDIDO: { count: 0, value: 0 }
        } as Record<DealStatus, { count: number; value: number }>
      }

      deals.forEach(deal => {
        stats.byStatus[deal.status].count++
        stats.byStatus[deal.status].value += deal.value
      })

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        total: 0,
        totalValue: 0,
        byStatus: {
          LEAD: { count: 0, value: 0 },
          QUALIFICADO: { count: 0, value: 0 },
          PROPOSTA: { count: 0, value: 0 },
          NEGOCIACAO: { count: 0, value: 0 },
          FECHADO: { count: 0, value: 0 },
          PERDIDO: { count: 0, value: 0 }
        }
      }
    }
  },

  async seedDeals(): Promise<void> {
    try {
      const dealCount = await prisma.deal.count()
      if (dealCount > 0) {
        console.log('Deals já existem no banco')
        return
      }

      // Buscar clientes existentes
      const clients = await prisma.client.findMany()
      if (clients.length === 0) {
        console.log('Nenhum cliente encontrado para criar deals')
        return
      }

      const defaultDeals = [
        {
          title: 'Website E-commerce',
          description: 'Desenvolvimento de loja virtual completa',
          clientId: clients[0].id,
          value: 35000,
          status: DealStatus.PROPOSTA,
          expectedCloseDate: new Date('2024-03-30')
        },
        {
          title: 'Sistema CRM',
          description: 'Implementação de sistema de gestão de clientes',
          clientId: clients[1]?.id || clients[0].id,
          value: 28000,
          status: DealStatus.NEGOCIACAO,
          expectedCloseDate: new Date('2024-04-15')
        },
        {
          title: 'App Delivery',
          description: 'Aplicativo para delivery de comida',
          clientId: clients[2]?.id || clients[0].id,
          value: 42000,
          status: DealStatus.QUALIFICADO,
          expectedCloseDate: new Date('2024-05-20')
        },
        {
          title: 'Portal Corporativo',
          description: 'Portal interno para colaboradores',
          clientId: clients[0].id,
          value: 18000,
          status: DealStatus.FECHADO,
          expectedCloseDate: new Date('2024-02-28')
        },
        {
          title: 'Sistema ERP',
          description: 'Sistema integrado de gestão empresarial',
          clientId: clients[1]?.id || clients[0].id,
          value: 65000,
          status: DealStatus.LEAD,
          expectedCloseDate: new Date('2024-06-30')
        }
      ]

      await prisma.deal.createMany({
        data: defaultDeals
      })

      console.log('Deals padrão criados com sucesso')
    } catch (error) {
      console.error('Erro ao criar deals padrão:', error)
    }
  }
}