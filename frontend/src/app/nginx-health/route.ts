import { NextResponse } from 'next/server'

/**
 * Em produção o Nginx responde /nginx-health diretamente.
 * Em dev, esta rota evita o 404 no console — retorna offline sem error.
 */
export async function GET() {
  return NextResponse.json({ status: 'offline' }, { status: 200 })
}
