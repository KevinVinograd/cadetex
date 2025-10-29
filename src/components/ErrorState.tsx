import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}


