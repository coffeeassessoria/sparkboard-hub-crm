import { useState, useEffect } from 'react'
import { clientsAPI, CreateClientRequest, UpdateClientRequest } from '../api/clients'
import { Client } from '@prisma/client'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await clientsAPI.getAll()
      setClients(data)
    } catch (err) {
      setError('Erro ao carregar clientes')
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: CreateClientRequest): Promise<Client | null> => {
    try {
      setError(null)
      const newClient = await clientsAPI.create(clientData)
      if (newClient) {
        setClients(prev => [newClient, ...prev])
        return newClient
      }
      return null
    } catch (err) {
      setError('Erro ao criar cliente')
      console.error('Erro ao criar cliente:', err)
      return null
    }
  }

  const updateClient = async (clientData: UpdateClientRequest): Promise<Client | null> => {
    try {
      setError(null)
      const updatedClient = await clientsAPI.update(clientData)
      if (updatedClient) {
        setClients(prev => 
          prev.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          )
        )
        return updatedClient
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar cliente')
      console.error('Erro ao atualizar cliente:', err)
      return null
    }
  }

  const deleteClient = async (clientId: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await clientsAPI.delete(clientId)
      if (success) {
        setClients(prev => prev.filter(client => client.id !== clientId))
        return true
      }
      return false
    } catch (err) {
      setError('Erro ao deletar cliente')
      console.error('Erro ao deletar cliente:', err)
      return false
    }
  }

  const getClientById = async (clientId: string): Promise<Client | null> => {
    try {
      setError(null)
      return await clientsAPI.getById(clientId)
    } catch (err) {
      setError('Erro ao buscar cliente')
      console.error('Erro ao buscar cliente:', err)
      return null
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientById
  }
}