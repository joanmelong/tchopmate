"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Bell, Check, X, Clock, ArrowLeft, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?redirect=/notifications')
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Erreur chargement notifications:', error)
      return
    }

    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, lue: true } : n)
      )
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('user_id', user.id)
      .eq('lue', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'commande_confirmee':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'commande_prete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'commande_annulee':
        return <X className="h-5 w-5 text-red-500" />
      case 'creneau_depasse':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'commande_en_preparation':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'commande_confirmee':
        return 'bg-blue-100 text-blue-700'
      case 'commande_prete':
        return 'bg-green-100 text-green-700'
      case 'commande_annulee':
        return 'bg-red-100 text-red-700'
      case 'creneau_depasse':
        return 'bg-orange-100 text-orange-700'
      case 'commande_en_preparation':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const unreadCount = notifications.filter(n => !n.lue).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="small" />
              <h1 className="text-xl font-semibold text-orange-600">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-orange-600 border-orange-300"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-500">Vous n'avez pas encore de notifications</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card 
                key={notif.id} 
                className={`transition-all ${notif.lue ? 'opacity-60' : 'border-l-4 border-l-orange-500'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{notif.titre}</h3>
                        <Badge className={getTypeColor(notif.type)}>
                          {notif.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.lue && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notif.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
