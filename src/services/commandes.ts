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

export async function createCommande(payload: CreateCommandePayload) {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('Vous devez être connecté pour passer une commande')
  }

  const res = await fetch('/api/commandes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
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

  const res = await fetch('/api/commandes', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error || 'Erreur récupération commandes')
  }
  return data.commandes
}
