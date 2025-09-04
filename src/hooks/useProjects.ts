import { useState, useEffect } from 'react'
import { projectsAPI, CreateProjectRequest, UpdateProjectRequest } from '../services/api'
import { Project } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectsAPI.getAll()
      setProjects(data)
    } catch (err) {
      setError('Erro ao carregar projetos')
      console.error('Erro ao buscar projetos:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: CreateProjectRequest): Promise<Project | null> => {
    try {
      setError(null)
      const newProject = await projectsAPI.create(projectData)
      if (newProject) {
        setProjects(prev => [newProject, ...prev])
        return newProject
      }
      return null
    } catch (err) {
      setError('Erro ao criar projeto')
      console.error('Erro ao criar projeto:', err)
      return null
    }
  }

  const updateProject = async (projectData: UpdateProjectRequest): Promise<Project | null> => {
    try {
      setError(null)
      const updatedProject = await projectsAPI.update(projectData)
      if (updatedProject) {
        setProjects(prev => 
          prev.map(project => 
            project.id === updatedProject.id ? updatedProject : project
          )
        )
        return updatedProject
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar projeto')
      console.error('Erro ao atualizar projeto:', err)
      return null
    }
  }

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await projectsAPI.delete(projectId)
      if (success) {
        setProjects(prev => prev.filter(project => project.id !== projectId))
        return true
      }
      return false
    } catch (err) {
      setError('Erro ao deletar projeto')
      console.error('Erro ao deletar projeto:', err)
      return false
    }
  }

  const getProjectById = async (projectId: string): Promise<Project | null> => {
    try {
      setError(null)
      return await projectsAPI.getById(projectId)
    } catch (err) {
      setError('Erro ao buscar projeto')
      console.error('Erro ao buscar projeto:', err)
      return null
    }
  }

  const getProjectsByClient = async (clientId: string): Promise<Project[]> => {
    try {
      setError(null)
      return await projectsAPI.getByClientId(clientId)
    } catch (err) {
      setError('Erro ao buscar projetos do cliente')
      console.error('Erro ao buscar projetos do cliente:', err)
      return []
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByClient
  }
}