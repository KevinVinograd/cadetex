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
  city?: string
  province?: string
  contact?: string
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  priority: 'NORMAL' | 'URGENT'
  scheduledDate?: string
  notes?: string
  courierNotes?: string
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
  unassignCourier?: boolean
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

  // Debug effect removed
  useEffect(() => {
    // no-op
  }, [tasks])

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
      const updatedTask = await apiService.updateTask(taskId, taskData)
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      setCurrentTask(prev => (prev && prev.id === taskId ? updatedTask : prev))
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
      setCurrentTask(prev => (prev && prev.id === taskId ? null : prev))
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

  const getTasksByOrganization = useCallback(async (organizationId: string): Promise<Task[]> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getTasksByOrganization(organizationId)
      setTasks(response)
      return response
    } catch (err) {
      console.error('Error fetching tasks by organization:', err)
      setError('Error al cargar las tareas de la organización')
      throw new Error('Error al cargar las tareas de la organización')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTasksByCourier = async (courierId: string): Promise<Task[]> => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiService.getTasksByCourier(courierId)
      setTasks(response)
      return response
    } catch (err) {
      console.error('Error fetching tasks by courier:', err)
      setError('Error al cargar las tareas del courier')
      throw new Error('Error al cargar las tareas del courier')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: 'PENDING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<Task> => {
    try {
      const updatedTask = await apiService.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      setCurrentTask(prev => (prev && prev.id === taskId ? updatedTask : prev))
      return updatedTask
    } catch (err) {
      console.error('Error updating task status:', err)
      throw new Error('Error al actualizar el estado de la tarea')
    }
  }

  const uploadTaskPhoto = async (taskId: string, photoFile: File, isReceipt = false): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)
      formData.append('isReceipt', String(isReceipt))

      const response = await apiService.uploadTaskPhoto(taskId, formData)
      return response.photoUrl
    } catch (err) {
      console.error('Error uploading task photo:', err)
      throw new Error('Error al subir la foto de la tarea')
    }
  }

  const getTaskPhotos = useCallback(async (taskId: string): Promise<any[]> => {
    try {
      const photos = await apiService.getTaskPhotos(taskId)
      return photos
    } catch (err) {
      console.error('Error fetching task photos:', err)
      throw new Error('Error al cargar las fotos de la tarea')
    }
  }, [])

  const getUnassignedTasks = useCallback(async (organizationId: string): Promise<Task[]> => {
    try {
      setIsLoading(true)
      setError(null)
      // Usar el nuevo endpoint del backend que ya filtra las tareas
      const response = await apiService.getUnassignedTasks(organizationId)
      return response
    } catch (err) {
      console.error('Error fetching unassigned tasks:', err)
      setError('Error al cargar las tareas sin asignar')
      throw new Error('Error al cargar las tareas sin asignar')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const assignTaskToCourier = async (taskId: string, courierId: string): Promise<Task> => {
    try {
      const updatedTask = await apiService.updateTask(taskId, { courierId })
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      setCurrentTask(prev => (prev && prev.id === taskId ? updatedTask : prev))
      return updatedTask
    } catch (err) {
      console.error('Error assigning task to courier:', err)
      throw new Error('Error al asignar la tarea al courier')
    }
  }

  const unassignTaskFromCourier = async (taskId: string): Promise<Task> => {
    try {
      const updatedTask = await apiService.updateTask(taskId, { unassignCourier: true })
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      setCurrentTask(prev => (prev && prev.id === taskId ? updatedTask : prev))
      return updatedTask
    } catch (err) {
      console.error('Error unassigning task from courier:', err)
      throw new Error('Error al desasignar la tarea del courier')
    }
  }

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
    uploadTaskPhoto,
    getTaskPhotos,
    getUnassignedTasks,
    assignTaskToCourier,
    unassignTaskFromCourier
  }
}
