import {
    ToastActionElement,
    ToastProps,
  } from "@/components/ui/toast"
  import { useState, useCallback } from "react"
  
  type ToastType = ToastProps & {
    id: string
    title?: string
    description?: string
    action?: ToastActionElement
  }
  
  export function useToast() {
    const [toasts, setToasts] = useState<ToastType[]>([])
  
    return {
      toasts,
      toast: useCallback((props: Omit<ToastType, "id">) => {
        setToasts((toasts) => [...toasts, { ...props, id: crypto.randomUUID() }])
      }, []),
      dismiss: useCallback((id: string) => {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
      }, []),
    }
  }