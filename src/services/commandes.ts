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
    const { data: { session } } = await supabase.auth.getSession()
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
      // 2. Utilisation du token reçu en argument.
      'Authorization': `Bearer ${token}`, 
    },
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
    throw new Error('Vous devez être connecté pour voir vos commandes')
  }

  try {
    const res = await fetch('/api/commandes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    const data = await res.json()
    console.log('Réponse API /api/commandes:', data)
    
    if (!res.ok) {
      throw new Error(data?.error || 'Erreur récupération commandes')
    }

    return data.commandes || []
  } catch (error) {
    console.error('Erreur fetch commandes:', error)
    throw error
  }
}
