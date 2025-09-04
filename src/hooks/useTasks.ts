import { useState, useEffect } from 'react'
import { tasksAPI, CreateTaskRequest, UpdateTaskRequest } from '../services/api'
import { Task, TaskStatus } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tasksAPI.getAll()
      setTasks(data)
    } catch (err) {
      setError('Erro ao carregar tarefas')
      console.error('Erro ao buscar tarefas:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: CreateTaskRequest): Promise<Task | null> => {
    try {
      setError(null)
      const newTask = await tasksAPI.create(taskData)
      if (newTask) {
        setTasks(prev => [newTask, ...prev])
        return newTask
      }
      return null
    } catch (err) {
      setError('Erro ao criar tarefa')
      console.error('Erro ao criar tarefa:', err)
      return null
    }
  }

  const updateTask = async (taskData: UpdateTaskRequest): Promise<Task | null> => {
    try {
      setError(null)
      const updatedTask = await tasksAPI.update(taskData)
      if (updatedTask) {
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        )
        return updatedTask
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar tarefa')
      console.error('Erro ao atualizar tarefa:', err)
      return null
    }
  }

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await tasksAPI.delete(taskId)
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
        return true
      }
      return false
    } catch (err) {
      setError('Erro ao deletar tarefa')
      console.error('Erro ao deletar tarefa:', err)
      return false
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Task | null> => {
    try {
      setError(null)
      const updatedTask = await tasksAPI.updateStatus(taskId, status)
      if (updatedTask) {
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        )
        return updatedTask
      }
      return null
    } catch (err) {
      setError('Erro ao atualizar status da tarefa')
      console.error('Erro ao atualizar status da tarefa:', err)
      return null
    }
  }

  const getTaskById = async (taskId: string): Promise<Task | null> => {
    try {
      setError(null)
      return await tasksAPI.getById(taskId)
    } catch (err) {
      setError('Erro ao buscar tarefa')
      console.error('Erro ao buscar tarefa:', err)
      return null
    }
  }

  const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    try {
      setError(null)
      return await tasksAPI.getByProjectId(projectId)
    } catch (err) {
      setError('Erro ao buscar tarefas do projeto')
      console.error('Erro ao buscar tarefas do projeto:', err)
      return []
    }
  }

  const getTasksByAssignee = async (assignedTo: string): Promise<Task[]> => {
    try {
      setError(null)
      return await tasksAPI.getByAssignee(assignedTo)
    } catch (err) {
      setError('Erro ao buscar tarefas do usuário')
      console.error('Erro ao buscar tarefas do usuário:', err)
      return []
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTaskById,
    getTasksByProject,
    getTasksByAssignee
  }
}