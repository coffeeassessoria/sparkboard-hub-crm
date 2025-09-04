import { authAPI } from './auth'
import { clientsAPI } from './clients'
import { projectsAPI } from './projects'
import { tasksAPI } from './tasks'
import { dealsAPI } from './deals'

// Exportar todas as APIs
export { authAPI, clientsAPI, projectsAPI, tasksAPI, dealsAPI }

// Função para inicializar o banco de dados com dados padrão
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Inicializando banco de dados...')
    
    // Criar usuários padrão primeiro
    await authAPI.seedUsers()
    
    // Criar clientes
    await clientsAPI.seedClients()
    
    // Criar projetos (depende dos clientes)
    await projectsAPI.seedProjects()
    
    // Criar tarefas (depende dos projetos)
    await tasksAPI.seedTasks()
    
    // Criar deals (depende dos clientes)
    await dealsAPI.seedDeals()
    
    console.log('Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error)
  }
}

// Função para verificar se o banco está vazio e precisa ser inicializado
export const checkAndInitializeDatabase = async (): Promise<void> => {
  try {
    const { prisma } = await import('../lib/prisma')
    
    // Verificar se existem usuários no banco
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('Banco de dados vazio. Inicializando com dados padrão...')
      await initializeDatabase()
    } else {
      console.log('Banco de dados já possui dados.')
    }
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error)
  }
}