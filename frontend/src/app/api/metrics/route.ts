import { NextResponse } from 'next/server'
import os from 'os'
import { statfs } from 'node:fs/promises'

export async function GET() {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const loadAvg = os.loadavg()
  const cpus = os.cpus()
  const mem = process.memoryUsage()

  let disk: { total: number; free: number; available: number } | null = null
  try {
    const stats = await statfs('/')
    disk = {
      total: stats.blocks * stats.bsize,
      free: stats.bfree * stats.bsize,
      available: stats.bavail * stats.bsize,
    }
  } catch {
    disk = null
  }

  return NextResponse.json({
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpuModel: cpus[0]?.model ?? 'Unknown',
      cpuCount: cpus.length,
      loadAvg1: loadAvg[0],
      loadAvg5: loadAvg[1],
      loadAvg15: loadAvg[2],
      totalMem,
      freeMem,
      uptime: os.uptime(),
    },
    process: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      uptime: process.uptime(),
      nodeVersion: process.version,
    },
    disk,
    timestamp: Date.now(),
  })
}
