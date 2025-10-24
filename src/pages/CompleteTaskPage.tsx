import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { PhotoUpload } from '../components/photo-upload'
import { ArrowLeft, Package, MapPin, Calendar, User, CheckCircle2, AlertCircle, Camera } from 'lucide-react'

export default function CompleteTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receiptPhoto, setReceiptPhoto] = useState<File | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the task by ID (TODO: implement real task loading)
  const task = null

  useEffect(() => {
    if (task?.notes) {
      setNotes(task.notes)
    }
  }, [task])

  if (!task) {
    return (
      <div className="space-y-8 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Tarea No Encontrada</h1>
          <p className="text-muted-foreground mb-4">La tarea que buscas no existe.</p>
          <Button onClick={() => navigate("/courier")}>
            Volver a Mis Tareas
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      en_preparacion: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pendiente_confirmar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmada_tomar: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      finalizada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelada: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    const labels = {
      en_preparacion: "En Preparación",
      pendiente_confirmar: "Pendiente Confirmar",
      confirmada_tomar: "Confirmada",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const handleReceiptPhotoUpload = (file: File) => {
    setReceiptPhoto(file)
  }

  const handleReceiptPhotoRemove = () => {
    setReceiptPhoto(null)
  }

  const handleAdditionalPhotoUpload = (file: File) => {
    setAdditionalPhotos(prev => [...prev, file])
  }

  const handleAdditionalPhotoRemove = (index: number) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!receiptPhoto) {
      alert('Debes subir una foto del acuse de recibo para finalizar la tarea')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would upload the photos and update the task status
      console.log('Task completed:', {
        taskId: task.id,
        receiptPhoto,
        additionalPhotos,
        notes,
        status: 'finalizada'
      })
      
      alert('¡Tarea completada exitosamente!')
      navigate("/courier")
    } catch (error) {
      console.error('Error completing task:', error)
      alert('Error al completar la tarea. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canComplete = task.status === "confirmada_tomar" || task.status === "en_progreso"

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/courier")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Mis Tareas
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Finalizar Tarea</h1>
          <p className="text-sm text-muted-foreground">Completa la tarea {task.referenceBL}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información de la Tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Referencia BL</label>
                <p className="text-lg font-semibold">{task.referenceBL}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <div className="mt-1">{getTypeBadge(task.type)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <div className="mt-1">{getStatusBadge(task.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="text-sm">{task.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha Programada</label>
                <p className="text-sm">{new Date(task.scheduledDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Direcciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección de Recogida</label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{task.pickupAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección de Entrega</label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{task.deliveryAddress}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Form */}
        <div className="lg:col-span-2 space-y-6">
          {!canComplete ? (
            <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Esta tarea no puede ser completada en este momento</p>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                  Solo las tareas con estado "Confirmada" o "En Progreso" pueden ser finalizadas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Receipt Photo - Required */}
              <PhotoUpload
                title="Foto del Acuse de Recibo"
                description="Sube una foto del acuse de recibo firmado por el cliente"
                isRequired={true}
                onPhotoUpload={handleReceiptPhotoUpload}
                onPhotoRemove={handleReceiptPhotoRemove}
                currentPhoto={task.receiptPhoto}
              />

              {/* Additional Photos */}
              <Card className="border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Fotos Adicionales
                  </CardTitle>
                  <CardDescription>Fotos opcionales de certificados o comprobantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {additionalPhotos.map((photo, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Additional photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{photo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(photo.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAdditionalPhotoRemove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          files.forEach(file => handleAdditionalPhotoUpload(file))
                        }
                        input.click()
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Agregar Fotos Adicionales
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border">
                <CardHeader>
                  <CardTitle>Notas Finales</CardTitle>
                  <CardDescription>Observaciones sobre la entrega o retiro</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Comentarios</Label>
                    <Textarea
                      id="notes"
                      placeholder="Agrega cualquier observación sobre la entrega..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/courier")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!receiptPhoto || isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalizar Tarea
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
