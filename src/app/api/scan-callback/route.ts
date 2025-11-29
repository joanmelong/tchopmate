import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { CommandeScannerService } from '@/services/CommandeScanner'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-scanapp-signature') || null

    const secret = process.env.SCANAPP_SECRET || ''

    // Si une signature est fournie, on la vérifie
    if (signature && secret) {
      const computed = crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
      if (computed !== signature) {
        return NextResponse.json({ ok: false, error: 'Signature invalide' }, { status: 401 })
      }
    }

    // Le body peut être un objet avec champ "scanResult" ou le body est le payload
    const scanData = body.scanResult || body.data || body.payload || body.result || body.q || body
    const scanJsonString = typeof scanData === 'string' ? scanData : JSON.stringify(scanData)

    // Appeler la logique métier pour traiter
    const domainOrder = await CommandeScannerService.processScannedQRCode(scanJsonString)
    if (!domainOrder) return NextResponse.json({ ok: false, error: 'Erreur traitement du QR' }, { status: 400 })

    // Retourner l'ordre en JSON (toObject depuis l'entité métier fournit un objet testé)
    return NextResponse.json({ ok: true, order: domainOrder.toObject() })
  } catch (e: any) {
    console.error('[API /scan-callback] Exception', e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
