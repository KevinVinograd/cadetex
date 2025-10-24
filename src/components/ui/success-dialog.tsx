import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onConfirm?: () => void
  confirmText?: string
  showCancel?: boolean
}

export function SuccessDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'success',
  onConfirm,
  confirmText = 'Aceptar',
  showCancel = false
}: SuccessDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          {showCancel && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



