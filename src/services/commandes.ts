export type CartItem = {
  id: number
  name: string
  price: string
  quantity: number
  image: string
}

export type CreateCommandePayload = {
  items: Array<{ name: string; quantity: number }>
  commentaire?: string | null
  livraison?: boolean
  creneau_retrait?: string | null
}

/**
 * Récupère le token d'authentification depuis Supabase
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erreur récupération session:', error)
      return null
    }
    
    if (!session) {
      console.log('Pas de session active')
      return null
    }
    
    console.log('Session trouvée, token présent:', !!session.access_token)
    return session?.access_token || null
  } catch (e) {
    console.error('Erreur récupération token:', e)
    return null
  }
}

export async function createCommande(payload: CreateCommandePayload, token: string) { 
  
  // 1. La vérification est maintenant basée sur le token que nous passons.
  if (!token) {
    throw new Error('Vous devez être connecté pour passer une commande')
  }
  
  const res = await fetch('/api/commandes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
    credentials: 'include', // Important pour envoyer les cookies de session
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  console.log(data)
  if (!res.ok) {
    throw new Error(data?.error || 'Erreur création commande')
  }

  return data.commande
}
export async function getCommandes() {
  const token = await getAuthToken()
  
  if (!token) {
    console.warn('Pas de token disponible pour récupérer les commandes')
    return []
  }

  try {
    const res = await fetch('/api/commandes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important pour envoyer les cookies de session
    })
    
    const data = await res.json()
    console.log('Réponse API /api/commandes:', data)
    
    if (!res.ok) {
      // Si non authentifié, retourner un tableau vide au lieu de throw
      if (res.status === 401) {
        console.warn('Non authentifié (401), retour tableau vide')
        return []
      }
      console.warn('Erreur API:', data?.error)
      return []
    }

    return data.commandes || []
  } catch (error) {
    console.error('Erreur fetch commandes:', error)
    // Retourner un tableau vide au lieu de throw pour ne pas bloquer l'UI
    return []
  }
}
