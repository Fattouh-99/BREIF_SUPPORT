'use client'
import { getMonthName } from '@/lib/utils'
import { Card, CardDescription, CardTitle } from '../ui/card'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Trash, UserCheck, Shield } from 'lucide-react'
import { onDeleteChat } from '@/actions/conversation'
import { Button } from '../ui/button'
import { useChatTime } from '@/hooks/conversation/use-conversation'
import { useToast } from '../ui/use-toast'
import { Badge } from '../ui/badge'

type Props = {
  id: string
  title: string
  description?: string
  createdAt?: Date
  seen?: boolean
  onChat: () => void
  onDelete?: () => void
  assignedAgent?: {
    id: string
    name: string
  }
  isCurrentUserAssigned?: boolean
  isLive?: boolean
}

const ChatCard = ({
  id,
  title,
  description,
  createdAt,
  seen,
  onChat,
  onDelete,
  assignedAgent,
  isCurrentUserAssigned,
  isLive = false,
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt!, id)
  const { toast } = useToast()

  const handleDelete = async () => {
    const result = await onDeleteChat(id)
    if (result.success) {
      onDelete?.()
    } else {
      toast({
        title: "Cannot Delete Chat",
        description: result.error,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="group relative flex items-start w-full">
      <button
        onClick={onChat}
        className={cn(
          "w-full flex items-start p-3 rounded-lg transition-colors",
          "hover:bg-muted/50 dark:hover:bg-gray-900/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          urgent && "bg-indigo-50 dark:bg-indigo-950/50",
          isLive && "border-l-2 border-l-green-500"
        )}
      >
        <div className="flex-1 min-w-0 text-left pr-9">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-medium truncate max-w-[160px]">{title}</p>
            {isLive && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] py-0 h-4 px-1 dark:bg-green-950 dark:text-green-300 dark:border-green-800 flex-shrink-0">
                Live
              </Badge>
            )}
            <span className="text-xs text-muted-foreground shrink-0 ml-auto">
              {messageSentAt}
            </span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1 max-w-full">
              {description}
            </p>
          )}
          {assignedAgent && (
            <div className="flex items-center mt-1.5 gap-1">
              <Badge variant="outline" className={cn(
                "text-xs py-0 h-5 px-1.5 flex items-center gap-1 font-normal",
                isCurrentUserAssigned ? 
                  "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" : 
                  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
              )}>
                {isCurrentUserAssigned ? (
                  <Shield className="h-3 w-3 text-green-500" />
                ) : (
                  <UserCheck className="h-3 w-3 text-indigo-500" />
                )}
                <span className="truncate max-w-[120px]">
                  {isCurrentUserAssigned ? 'Assigned to you' : `Handled by ${assignedAgent.name}`}
                </span>
              </Badge>
            </div>
          )}
        </div>
      </button>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default ChatCard
