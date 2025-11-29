import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getClientFromRequest } from "@/lib/supabase-server"
import type { NextRequest } from "next/server"

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error("Supabase URL ou service key manquante pour API /api/qrcodes")
}

const admin = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false },
})

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/qrcodes appelé')
    // Log Authorization header for debugging
    try {
      console.log('Authorization header:', request.headers.get('authorization'))
    } catch (e) {
      console.warn('Impossible de lire headers authorization', e)
    }

    // Vérifier l'authentification
    const client = await getClientFromRequest(request)

    if (!client) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, qrCodeDataUrl, data } = body

    if (!orderId || !qrCodeDataUrl || !data) {
      return NextResponse.json(
        { error: "orderId, qrCodeDataUrl et data sont requis" },
        { status: 400 }
      )
    }

    console.log('Body reçu POST /api/qrcodes:', { orderId, hasQrCodeDataUrl: !!qrCodeDataUrl, dataKeys: Object.keys(data || {}) })

    // Insérer ou mettre à jour le QR code en BD (table `qr_commandes`)
    console.log('Insertion/upsert QR code pour order:', orderId, 'client:', client.id)
    const payload = {
      order_id: orderId,
      client_id: client.id,
      qr_code_data_url: qrCodeDataUrl,
      qr_code_data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Essayer upsert d'abord (si constraint unique existe), sinon fallback sur insert
    let qrcode: { id: number; commande_id: number; qr_code_data: string; created_at: string; updated_at: string } | null = null
    let insertError: Error | null = null

    try {
      const upsertRes = await admin.from("qr_commandes").upsert(payload).select()
      qrcode = upsertRes.data?.[0] ?? null
      insertError = upsertRes.error
    } catch (e) {
      insertError = e instanceof Error ? e : new Error(String(e))
    }

    if (insertError) {
      console.warn('Upsert QR code a échoué, tentative d\'insertion simple:', insertError)
      try {
        const insertRes = await admin.from('qr_commandes').insert(payload).select()
        qrcode = insertRes.data?.[0] ?? null
        insertError = insertRes.error
      } catch (e) {
        insertError = e instanceof Error ? e : new Error(String(e))
      }
    }

    if (insertError) {
      console.error('Erreur insertion QR code finale:', insertError)
      return NextResponse.json(
        { error: insertError?.message ?? String(insertError) ?? 'Erreur insertion QR code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, qrcode }, { status: 201 })
  } catch (e) {
    console.error("Exception POST /api/qrcodes:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const client = await getClientFromRequest(request)

    if (!client) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Récupérer tous les QR codes du client (table `qr_commandes`)
    const { data: qrcodes, error } = await admin
      .from("qr_commandes")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur fetch QR codes:", error)
      return NextResponse.json(
        { error: error.message ?? "Erreur lecture QR codes" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, qrcodes: qrcodes ?? [] })
  } catch (e) {
    console.error("Exception GET /api/qrcodes:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const client = await getClientFromRequest(request)

    if (!client) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Récupérer l'ID du QR code depuis l'URL
    const url = new URL(request.url)
    const orderId = url.pathname.split("/").pop()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID requis" },
        { status: 400 }
      )
    }

    // Supprimer le QR code (table `qr_commandes`)
    const { error: deleteError } = await admin
      .from("qr_commandes")
      .delete()
      .eq("order_id", orderId)
      .eq("client_id", client.id)

    if (deleteError) {
      console.error("Erreur suppression QR code:", deleteError)
      return NextResponse.json(
        { error: deleteError.message ?? "Erreur suppression QR code" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Exception DELETE /api/qrcodes:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
