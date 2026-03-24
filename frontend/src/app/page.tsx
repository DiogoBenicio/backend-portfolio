import { HeroSection } from '@/components/landing/HeroSection'
import { TechStackSection } from '@/components/landing/TechStackSection'
import { ArrowDown, Layers, Plug, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TechStackSection />

      {/* Arquitetura */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Padrões Arquiteturais</h2>
          <p className="mb-10 text-gray-500">
            Cada serviço adota o padrão que melhor se encaixa em sua responsabilidade.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card Hexagonal */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
                  <Layers size={15} className="text-indigo-600" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-indigo-800">Arquitetura Hexagonal</h3>
                  <p className="text-xs text-indigo-500">Weather-API · NPS-API</p>
                </div>
              </div>

              {/* Camadas */}
              <div className="flex flex-col gap-0">
                {/* Adapter IN */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">Adapter IN</span>
                  </div>
                  <p className="mt-1 text-[11px] text-blue-500">
                    Controllers REST · Spring @RestController · Fastify Routes
                  </p>
                </div>

                {/* Seta */}
                <div className="flex flex-col items-center py-1">
                  <ArrowDown size={14} className="text-purple-300" />
                  <span className="text-[9px] text-purple-300">porta de entrada</span>
                </div>

                {/* Domain */}
                <div className="rounded-xl border border-purple-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700">Domain</span>
                  </div>
                  <p className="mt-1 text-[11px] text-indigo-400">
                    Service · Port/in · Port/out · Model — zero dependência de framework
                  </p>
                </div>

                {/* Seta */}
                <div className="flex flex-col items-center py-1">
                  <ArrowDown size={14} className="text-purple-300" />
                  <span className="text-[9px] text-purple-300">porta de saída</span>
                </div>

                {/* Adapter OUT */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Plug size={13} className="text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700">Adapter OUT</span>
                  </div>
                  <p className="mt-1 text-[11px] text-orange-500">
                    Elasticsearch · Prisma / PostgreSQL · OpenWeather WebClient
                  </p>
                </div>
              </div>
            </div>

            {/* Card Gateway */}
            <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                  <Plug size={15} className="text-blue-600" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Proxy + Middleware</h3>
                  <p className="text-xs text-blue-400">Gateway-API</p>
                </div>
              </div>

              <p className="text-xs text-blue-600">
                Único ponto de entrada para os backends. Centraliza cross-cutting concerns sem
                lógica de negócio.
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { label: 'Auth JWT', desc: 'Valida token em todas as rotas protegidas' },
                  { label: 'Rate Limit', desc: '30 req/min por IP via @fastify/rate-limit' },
                  { label: 'Route Proxy', desc: 'Repassa para Weather-API ou NPS-API' },
                  { label: 'Request Logger', desc: 'Log estruturado de método, path e status' },
                ].map(({ label, desc }) => (
                  <div key={label} className="rounded-lg border border-blue-100 bg-white px-3 py-2">
                    <span className="text-xs font-semibold text-blue-700">{label}</span>
                    <p className="text-[11px] text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto rounded-lg border border-blue-100 bg-white px-3 py-2">
                <p className="text-[11px] text-gray-400">
                  Stack: <span className="font-medium text-gray-600">Node.js · Fastify · TypeScript</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-semibold text-gray-700">Diogo Silveira Benício</p>
            <p className="mt-0.5 text-xs">Full Stack Engineer · Uberlândia/MG</p>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <a
              href="mailto:diogobenicio@hotmail.com"
              className="flex items-center gap-1.5 hover:text-blue-600"
            >
              diogobenicio@hotmail.com
            </a>
            <span className="text-gray-200">|</span>
            <a
              href="https://linkedin.com/in/diogosbenicio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-600"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
