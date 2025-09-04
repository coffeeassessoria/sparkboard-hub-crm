import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Search } from 'lucide-react'
import { Cliente } from './ClientManager'

interface ClientSelectorProps {
  value?: string
  onValueChange: (clientId: string, clientName: string) => void
  placeholder?: string
  className?: string
}

export function ClientSelector({ value, onValueChange, placeholder = "Selecionar cliente", className }: ClientSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Carregar clientes do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('sparkboard-clients')
    if (savedClients) {
      setClientes(JSON.parse(savedClients))
    }
  }, [])

  // Filtrar apenas clientes ativos
  const activeClients = clientes.filter(client => client.status === 'Ativo')

  // Filtrar clientes por busca
  const filteredClients = activeClients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleClientSelect = (clientId: string) => {
    const selectedClient = activeClients.find(client => client.id === clientId)
    if (selectedClient) {
      onValueChange(clientId, selectedClient.nome)
    }
  }

  const selectedClient = activeClients.find(client => client.id === value)

  if (isSearchMode) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={value} onValueChange={handleClientSelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{client.nome}</div>
                      {client.empresa && (
                        <div className="text-xs text-muted-foreground">{client.empresa}</div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-results" disabled>
                Nenhum cliente encontrado
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSearchMode(false)
            setSearchTerm('')
          }}
        >
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={value} onValueChange={handleClientSelect}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder={placeholder}>
            {selectedClient && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedClient.nome}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {activeClients.length > 0 ? (
            activeClients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{client.nome}</div>
                    {client.empresa && (
                      <div className="text-xs text-muted-foreground">{client.empresa}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-clients" disabled>
              Nenhum cliente ativo cadastrado
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setIsSearchMode(true)}
        title="Buscar cliente"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}