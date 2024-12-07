import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: number
}

export function Loading({ className, size = 24 }: LoadingProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className={cn('animate-spin text-primary', className)} size={size} />
    </div>
  )
}
