import { useState, useEffect } from 'react'
import { dealsAPI, CreateDealRequest, UpdateDealRequest } from '../api/deals'
import { Deal, DealStatus } from '@prisma/client'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dealsAPI.getAll()
      setDeals(data)
    } catch (err) {
      setError('Erro ao carregar deals')
      console.error('Erro ao buscar deals:', err)
    } finally {
      setLoading(false)
    }
  }

  const createDeal = async (dealData: CreateDealRequest): Promise<Deal | null> => {
    try {
      setError(null)
      const newDeal = await dealsAPI.create(dealData)
      if (newDeal) {
        setDeals(prev => [newDeal, ...prev])
        return newDeal
      }
      return null
    } catch (err) {
      setError('Erro ao criar deal')
      console.error('Erro ao criar deal:', err)
      return null
    }
  }

  const updateDeal = async (dealData: UpdateDealRequest): Promise<Deal | null> => {
    try {
      setError(null)
      const updatedDeal = await dealsAPI.update(dealData)
      if (updatedDeal) {
        setDeals(prev => 
          prev.map(deal => 
            deal.id === updatedDeal.id ? updatedDeal : deal
          )
        )
        return updatedDeal
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar deal')
      console.error('Erro ao atualizar deal:', err)
      return null
    }
  }

  const deleteDeal = async (dealId: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await dealsAPI.delete(dealId)
      if (success) {
        setDeals(prev => prev.filter(deal => deal.id !== dealId))
        return true
      }
      return false
    } catch (err) {
      setError('Erro ao deletar deal')
      console.error('Erro ao deletar deal:', err)
      return false
    }
  }

  const updateDealStatus = async (dealId: string, status: DealStatus): Promise<Deal | null> => {
    try {
      setError(null)
      const updatedDeal = await dealsAPI.updateStatus(dealId, status)
      if (updatedDeal) {
        setDeals(prev => 
          prev.map(deal => 
            deal.id === updatedDeal.id ? updatedDeal : deal
          )
        )
        return updatedDeal
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar status do deal')
      console.error('Erro ao atualizar status do deal:', err)
      return null
    }
  }

  const getDealById = async (dealId: string): Promise<Deal | null> => {
    try {
      setError(null)
      return await dealsAPI.getById(dealId)
    } catch (err) {
      setError('Erro ao buscar deal')
      console.error('Erro ao buscar deal:', err)
      return null
    }
  }

  const getDealsByClient = async (clientId: string): Promise<Deal[]> => {
    try {
      setError(null)
      return await dealsAPI.getByClientId(clientId)
    } catch (err) {
      setError('Erro ao buscar deals do cliente')
      console.error('Erro ao buscar deals do cliente:', err)
      return []
    }
  }

  const getDealsByStatus = async (status: DealStatus): Promise<Deal[]> => {
    try {
      setError(null)
      return await dealsAPI.getByStatus(status)
    } catch (err) {
      setError('Erro ao buscar deals por status')
      console.error('Erro ao buscar deals por status:', err)
      return []
    }
  }

  const getStatistics = async () => {
    try {
      setError(null)
      return await dealsAPI.getStatistics()
    } catch (err) {
      setError('Erro ao buscar estatísticas')
      console.error('Erro ao buscar estatísticas:', err)
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
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  return {
    deals,
    loading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    updateDealStatus,
    getDealById,
    getDealsByClient,
    getDealsByStatus,
    getStatistics
  }
}