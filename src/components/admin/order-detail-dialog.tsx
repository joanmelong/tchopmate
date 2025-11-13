"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface OrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: any
  onMarkAsInProgress?: (orderId: string) => void
  onMarkAsDelivered?: (orderId: string) => void
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  onMarkAsInProgress,
  onMarkAsDelivered,
}: OrderDetailDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Détails de la commande</DialogTitle>
          <DialogDescription>{order.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Client</p>
            <p className="font-semibold text-gray-900">{order.customer}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Adresse de livraison</p>
            <p className="font-semibold text-gray-900">{order.address}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Articles commandés</p>
            <div className="bg-orange-50 rounded p-3 space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.qty}
                  </span>
                  <span className="text-gray-900 font-medium">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-orange-600">{order.total}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
            <div className="flex items-center gap-2">
              {order.status === "livrée" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Livrée</span>
                </>
              ) : order.status === "en cours" ? (
                <>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-600">En cours</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-600">En attente</span>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>

          <div className="flex gap-2">
            {order.status === "aucun" && (
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => {
                  onMarkAsInProgress?.(order.id)
                  onOpenChange(false)
                }}
              >
                <Clock className="h-4 w-4 mr-1" />
                Mettre en cours
              </Button>
            )}
            {order.status === "en cours" && (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  onMarkAsDelivered?.(order.id)
                  onOpenChange(false)
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marquer livrée
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
