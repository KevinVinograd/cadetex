import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { useTasks } from "../hooks/use-tasks"

// Helper function to format dates consistently
const formatDate = (dateString: string | undefined, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return "No programada"
  
  let date: Date
  if (dateString.includes('T') || dateString.includes('Z')) {
    // Full ISO date
    date = new Date(dateString)
  } else {
    // YYYY-MM-DD format - add time to avoid timezone issues
    date = new Date(dateString + 'T00:00:00')
  }
  
  return date.toLocaleDateString('es-ES', options)
}

import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  Building2,
  Navigation,
  Play,
  Save,
  MessageSquare,
  Download,
  Image as ImageIcon,
  Camera,
  Upload
} from "lucide-react"

export default function CourierTaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTaskById, currentTask, isLoadingTask, taskError, getTaskPhotos, uploadTaskPhoto, updateTask } = useTasks()
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [additionalPhotos, setAdditionalPhotos] = useState<any[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Find the task by ID
  const task = currentTask

  // Load task when ID changes
  useEffect(() => {
    if (id && (!currentTask || currentTask.id !== id)) {
      getTaskById(id)
    }
  }, [id, getTaskById, currentTask])

  // Refresh task when component becomes visible (user returns to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        getTaskById(id)
        loadPhotos()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [id, getTaskById])

  // Load additional photos when task is loaded
  useEffect(() => {
    if (id && task) {
      loadPhotos()
    }
  }, [id, task])

  // Load courier notes when task is loaded
  useEffect(() => {
    if (task?.courierNotes) {
      setNotes(task.courierNotes)
    }
  }, [task])

  const loadPhotos = async () => {
    if (!id) return
    setIsLoadingPhotos(true)
    try {
      const photos = await getTaskPhotos(id)
      setAdditionalPhotos(photos)
    } catch (err) {
      console.error('Error loading photos:', err)
    } finally {
      setIsLoadingPhotos(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    }
  }

  const handleUploadAdditionalPhoto = async () => {
    if (!selectedFile || !id) return
    
    setIsUploading(true)
    try {
      await uploadTaskPhoto(id, selectedFile, false) // false = foto adicional
      await loadPhotos() // Recargar fotos
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Error uploading photo:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Get the relevant address based on task type
  const getTaskAddress = () => {
    return task?.addressOverride || "Sin dirección especificada"
  }
  
  // Get the relevant contact based on task type
  const getTaskContact = () => {
    return task?.contact || "Sin contacto especificado"
  }
  
  // Get the relevant city based on task type
  const getTaskCity = () => {
    return task?.city || "Sin ciudad especificada"
  }

  // Function to download the receipt photo
  const handleDownloadPhoto = () => {
    if (task?.receiptPhotoUrl) {
      const link = document.createElement('a')
      link.href = task.receiptPhotoUrl
      link.download = `comprobante-${task.referenceNumber || task.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  
  // Show loading state
  if (isLoadingTask) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold">Loading Task...</h1>
          <p className="text-muted-foreground mb-4">Please wait while we load the task details.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (taskError) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Error Loading Task</h1>
          <p className="text-muted-foreground mb-4">{taskError}</p>
          <Button onClick={() => navigate("/courier")}>
            Back to My Tasks
          </Button>
        </div>
      </div>
    )
  }

  // Show not found state
  if (!task) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Task Not Found</h1>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/courier")}>
            Back to My Tasks
          </Button>
        </div>
      </div>
    )
  }

  // Load client details
  const client = null

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[priority as keyof typeof variants]}>{priority}</Badge>
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsUpdating(false)
  }

  const handleNotesUpdate = async () => {
    if (!id || !notes.trim()) return
    
    setIsUpdating(true)
    try {
      await updateTask(id, { courierNotes: notes.trim() })
      // Reload task to get updated data
      if (id) {
        await getTaskById(id)
      }
    } catch (err) {
      console.error('Error updating notes:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const canStartTask = task?.status === "PENDING" || task?.status === "PENDING_CONFIRMATION"
  const canCompleteTask = task?.status === "CONFIRMED"
  const isTaskCompleted = task?.status === "COMPLETED"

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/courier")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Tasks
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Task Details</h1>
          <p className="text-sm text-muted-foreground">Manage your assigned task {task.referenceNumber}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
          {/* Address - Most Important */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {task.type === "RETIRE" ? "Dirección de Retiro" : "Dirección de Entrega"}
              </CardTitle>
              <CardDescription>
                {task.type === "RETIRE" ? "Ubicación donde retirar" : "Ubicación donde entregar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {task.type === "RETIRE" ? "Dirección de Retiro" : "Dirección de Entrega"}
                </label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">{getTaskAddress()}</p>
                  {(getTaskCity() || task.province) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {[getTaskCity(), task.province].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {getTaskContact() && (
                    <p className="text-sm text-muted-foreground mt-1">{getTaskContact()}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const address = `${getTaskAddress()}, ${getTaskCity()}, ${task.province}`
                    window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank')
                  }}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Ir a Dirección
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Overview - Unified Information */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información de la Tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Priority Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority || "normal")}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{task.referenceNumber}</p>
                  <p className="text-xs text-muted-foreground">{task.type === "RETIRE" ? "Retiro" : "Entrega"}</p>
                </div>
              </div>

              {/* Date and Contact Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha Programada</label>
                  <p className="text-sm font-medium">
                    {formatDate(task.scheduledDate, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contacto</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{getTaskContact()}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-4 border-t">
                {canStartTask && (
                  <Button 
                    className="w-full mb-2" 
                    onClick={() => handleStatusUpdate("confirmada_tomar")}
                    disabled={isUpdating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isUpdating ? "Iniciando..." : "Iniciar Tarea"}
                  </Button>
                )}
                
                {isTaskCompleted && (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-600">Tarea Finalizada</p>
                    <p className="text-xs text-muted-foreground">¡Excelente trabajo!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Task Notes
              </CardTitle>
              <CardDescription>Special instructions or additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Add Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this delivery..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleNotesUpdate} 
                disabled={isUpdating || !notes.trim()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>

          {/* Receipt Photo - At the bottom */}
          {task.receiptPhotoUrl && (
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Comprobante de Entrega
                </CardTitle>
                <CardDescription>
                  Foto subida por el courier como comprobante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <img
                    src={task.receiptPhotoUrl}
                    alt="Comprobante de entrega"
                    className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadPhoto}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar Foto
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Photos Section */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Fotos Adicionales
              </CardTitle>
              <CardDescription>
                Agregá fotos adicionales si necesitas documentar algo más
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload new photo */}
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUploadAdditionalPhoto}
                        disabled={isUploading}
                        size="sm"
                      >
                        {isUploading ? "Subiendo..." : "Subir Foto"}
                      </Button>
                      <Button
                        onClick={() => setSelectedFile(null)}
                        variant="ghost"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Seleccioná una foto adicional
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Foto
                    </Button>
                  </div>
                )}
              </div>

              {/* Display additional photos */}
              {isLoadingPhotos ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando fotos...
                </div>
              ) : additionalPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {additionalPhotos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.photoUrl}
                        alt="Foto adicional"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = photo.photoUrl
                          link.download = `foto-${photo.id}.jpg`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay fotos adicionales aún
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  )
}

