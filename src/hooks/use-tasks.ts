import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../lib/api'

export interface Task {
  id: string
  organizationId: string
  type: 'RETIRE' | 'DELIVER'
  referenceNumber?: string
  clientId?: string
  clientName?: string
  providerId?: string
  providerName?: string
  courierId?: string
  courierName?: string
  addressOverride?: string
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  priority: 'NORMAL' | 'URGENT'
  scheduledDate?: string
  notes?: string
  mbl?: string
  hbl?: string
  freightCert: boolean
  foCert: boolean
  bunkerCert: boolean
  linkedTaskId?: string
  receiptPhotoUrl?: string
  photoRequired: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  organizationId: string
  type: 'RETIRE' | 'DELIVER'
  referenceNumber?: string
  clientId?: string
  providerId?: string
  courierId?: string
  addressOverride?: string
  priority: 'NORMAL' | 'URGENT'
  scheduledDate?: string
  notes?: string
  mbl?: string
  hbl?: string
  freightCert?: boolean
  foCert?: boolean
  bunkerCert?: boolean
  linkedTaskId?: string
}

export interface UpdateTaskRequest {
  type?: 'RETIRE' | 'DELIVER'
  referenceNumber?: string
  clientId?: string
  providerId?: string
  courierId?: string
  addressOverride?: string
  status?: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  scheduledDate?: string
  notes?: string
  mbl?: string
  hbl?: string
  freightCert?: boolean
  foCert?: boolean
  bunkerCert?: boolean
  linkedTaskId?: string
  receiptPhotoUrl?: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getTasks()
      setTasks(response)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError('Error al cargar las tareas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
    try {
      const newTask = await apiService.createTask(taskData)
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      console.error('Error creating task:', err)
      throw new Error('Error al crear la tarea')
    }
  }

  const updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<Task> => {
    try {
      console.log('Hook updateTask - ID:', taskId, 'Data:', taskData)
      const updatedTask = await apiService.updateTask(taskId, taskData)
      console.log('Hook updateTask - Respuesta del API:', updatedTask)
      setTasks(prev => {
        const newTasks = prev.map(task => task.id === taskId ? updatedTask : task)
        console.log('Hook updateTask - Estado actualizado:', newTasks.find(t => t.id === taskId))
        return newTasks
      })
      return updatedTask
    } catch (err) {
      console.error('Error updating task:', err)
      throw new Error('Error al actualizar la tarea')
    }
  }

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      await apiService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      throw new Error('Error al eliminar la tarea')
    }
  }

  const getTaskById = useCallback(async (taskId: string): Promise<Task | null> => {
    try {
      setIsLoadingTask(true)
      setTaskError(null)
      const task = await apiService.getTask(taskId)
      setCurrentTask(task)
      return task
    } catch (err) {
      console.error('Error fetching task:', err)
      setTaskError('Error al cargar la tarea')
      setCurrentTask(null)
      return null
    } finally {
      setIsLoadingTask(false)
    }
  }, [])

  const getTasksByOrganization = async (organizationId: string): Promise<Task[]> => {
    try {
      return await apiService.getTasksByOrganization(organizationId)
    } catch (err) {
      console.error('Error fetching tasks by organization:', err)
      throw new Error('Error al cargar las tareas de la organización')
    }
  }

  const getTasksByCourier = async (courierId: string): Promise<Task[]> => {
    try {
      return await apiService.getTasksByCourier(courierId)
    } catch (err) {
      console.error('Error fetching tasks by courier:', err)
      throw new Error('Error al cargar las tareas del courier')
    }
  }

  const updateTaskStatus = async (taskId: string, status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<Task> => {
    try {
      const updatedTask = await apiService.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      return updatedTask
    } catch (err) {
      console.error('Error updating task status:', err)
      throw new Error('Error al actualizar el estado de la tarea')
    }
  }

  const uploadTaskPhoto = async (taskId: string, photoFile: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)

      const response = await apiService.uploadTaskPhoto(taskId, formData)
      return response.photoUrl
    } catch (err) {
      console.error('Error uploading task photo:', err)
      throw new Error('Error al subir la foto de la tarea')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    isLoading,
    error,
    currentTask,
    isLoadingTask,
    taskError,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByOrganization,
    getTasksByCourier,
    updateTaskStatus,
    uploadTaskPhoto
  }
}
