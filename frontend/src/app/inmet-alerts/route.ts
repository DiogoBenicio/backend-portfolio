import { NextResponse } from 'next/server'

export const revalidate = 1800 // 30 min

interface InmetAlert {
  id: string
  event: string
  severity: 'perigo' | 'perigo_potencial' | 'atencao'
  start: string
  end: string
  description: string
  areas: string[]
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function extractTableField(html: string, fieldName: string): string {
  // Match <th>fieldName</th><td>value</td> (with possible whitespace/newlines)
  const re = new RegExp(
    '<th[^>]*>\\s*' + fieldName + '\\s*</th>\\s*<td[^>]*>([\\s\\S]*?)</td>',
    'i'
  )
  const m = html.match(re)
  if (!m) return ''
  // Strip any remaining HTML tags
  return m[1].replace(/<[^>]+>/g, '').trim()
}

function parseSeverity(raw: string): InmetAlert['severity'] {
  const lower = raw.toLowerCase()
  if (lower.includes('perigo potencial')) return 'perigo_potencial'
  if (lower.includes('perigo')) return 'perigo'
  return 'atencao'
}

function parseInmetRss(xml: string): InmetAlert[] {
  const alerts: InmetAlert[] = []

  const itemRe = /<item>([\s\S]*?)<\/item>/gi
  let itemMatch: RegExpExecArray | null

  while ((itemMatch = itemRe.exec(xml)) !== null) {
    const item = itemMatch[1]

    // guid — last path segment
    const guidMatch = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)
    const rawGuid = guidMatch ? guidMatch[1].trim() : ''
    const id = rawGuid.split('/').filter(Boolean).pop() ?? rawGuid

    // title
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? unescapeHtml(titleMatch[1]).trim() : ''

    // description (HTML-escaped inside CDATA or not)
    const descTagMatch = item.match(/<description>([\s\S]*?)<\/description>/i)
    const rawDesc = descTagMatch ? descTagMatch[1] : ''
    const htmlDesc = unescapeHtml(rawDesc)

    // Extract fields from the HTML table inside description
    const event = extractTableField(htmlDesc, 'Evento') || title
    const severityRaw = extractTableField(htmlDesc, 'Severidade')
    const severity = parseSeverity(severityRaw || title)
    const start = extractTableField(htmlDesc, 'In(?:í|i)cio')
    const end = extractTableField(htmlDesc, 'Fim')
    const description = extractTableField(htmlDesc, 'Descri(?:ç|c)(?:ã|a)o')

    // Area field — "Aviso para as Áreas: X, Y, Z"
    const areaRaw = extractTableField(htmlDesc, '(?:Á|A)rea')
    const areaClean = areaRaw.replace(/^Aviso para as\s+[Áa]reas?:\s*/i, '').trim()
    const areas = areaClean
      ? areaClean
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : []

    if (id) {
      alerts.push({ id, event, severity, start, end, description, areas })
    }
  }

  return alerts
}

export async function GET() {
  try {
    const res = await fetch('https://apiprevmet3.inmet.gov.br/avisos/rss', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 1800 },
    })
    if (!res.ok) return NextResponse.json([], { status: 200 })
    const xml = await res.text()
    const alerts = parseInmetRss(xml)
    return NextResponse.json(alerts, {
      headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate' },
    })
  } catch {
    return NextResponse.json([])
  }
}
