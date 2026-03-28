import { NextResponse } from 'next/server'

/**
 * Em produção o Nginx resolve /api/health antes de chegar ao Next.js.
 * Em dev, esta rota evita o 404 e tenta fazer proxy para o gateway real.
 */
export async function GET() {
  try {
    const res = await fetch('http://gateway-api:3001/health', {
      signal: AbortSignal.timeout(3000),
    })
    const body = await res.json().catch(() => ({ status: 'ok' }))
    return NextResponse.json(body, { status: res.status })
  } catch {
    // gateway não disponível em dev — retorna offline sem jogar 404 no console
    return NextResponse.json({ status: 'offline' }, { status: 200 })
  }
}
