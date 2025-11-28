import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnreadCount()

    // Recharger toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUnreadCount(0)
        setLoading(false)
        return
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('lue', false)

      if (error) {
        console.error('Erreur chargement notifications:', error)
        return
      }

      setUnreadCount(count || 0)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  return { unreadCount, loading, refresh: loadUnreadCount }
}
