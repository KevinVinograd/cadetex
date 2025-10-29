import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CheckCircle2, X } from "lucide-react"
import { getTranslation } from "@/lib/translations"

const t = getTranslation()

interface FinalizeTaskModalProps {
  isOpen: boolean
  task: any
  receiptPhoto: string | null
  additionalPhotos: string[]
  isFinalizing: boolean
  onClose: () => void
  onSubmit: () => void
  onReceiptPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAdditionalPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveAdditionalPhoto: (index: number) => void
}

export function FinalizeTaskModal({
  isOpen,
  task,
  receiptPhoto,
  additionalPhotos,
  isFinalizing,
  onClose,
  onSubmit,
  onReceiptPhotoChange,
  onAdditionalPhotoChange,
  onRemoveAdditionalPhoto
}: FinalizeTaskModalProps) {
  if (!isOpen || !task) return null

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {t.finalizeTask.title}
          </CardTitle>
          <CardDescription>
            {task.referenceBL} - {task.clientName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notas de la tarea */}
          {task.notes && (
            <div className="space-y-3 p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {t.finalizeTask.taskNotes}
                  </Label>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t.finalizeTask.taskNotesDescription}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-amber-900/10 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  {task.notes}
                </p>
              </div>
            </div>
          )}

          {/* Foto de recibo obligatoria */}
          {task.photoRequired && (
            <div className="space-y-3 p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-primary">
                    {t.finalizeTask.receiptPhotoRequired}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t.finalizeTask.receiptPhotoRequiredDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptPhoto" className="text-sm font-medium">{t.finalizeTask.receiptPhoto}</Label>
                <Input
                  id="receiptPhoto"
                  type="file"
                  accept="image/*"
                  onChange={onReceiptPhotoChange}
                  className="text-sm border-primary/30 focus:border-primary"
                />
                {receiptPhoto && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {t.finalizeTask.receiptPhotoUploaded}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotos adicionales opcionales */}
          <div className="space-y-3 p-4 border border-dashed border-muted-foreground/20 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-muted">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {t.finalizeTask.additionalPhotosLabel}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t.finalizeTask.additionalPhotosDesc}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={onAdditionalPhotoChange}
                className="text-sm"
              />
              {additionalPhotos.length > 0 && (
                <div className="space-y-2">
                  {additionalPhotos.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700 dark:text-blue-400 font-medium flex-1">
                        {t.finalizeTask.photoAdditional} {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAdditionalPhoto(index)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isFinalizing}
            >
              {t.finalizeTask.cancel}
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={onSubmit}
              disabled={isFinalizing || (task.photoRequired && !receiptPhoto)}
            >
              {isFinalizing ? t.finalizeTask.submitting : t.finalizeTask.submit}
            </Button>
          </div>

          {task.photoRequired && !receiptPhoto && (
            <p className="text-xs text-red-500 text-center">
              {t.finalizeTask.errorMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

