import { HeroSection } from '@/components/landing/HeroSection'
import { TechStackSection } from '@/components/landing/TechStackSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TechStackSection />

      {/* Arquitetura */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Arquitetura Hexagonal</h2>
          <p className="mb-8 text-gray-500">
            Todos os projetos implementam Ports & Adapters — o domínio é completamente isolado da
            infraestrutura.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-6 font-mono text-sm text-gray-700">
            <pre>
              {`domain/
  model/        → Entidades e value objects (Java records / TS interfaces)
  port/
    in/         → Casos de uso (interfaces driving)
    out/        → Portas de saída (interfaces driven)
  service/      → Implementações puras — zero dependência de framework

adapter/
  in/web|http/  → Controllers REST (Spring @RestController / Fastify routes)
  out/
    elasticsearch|database/ → Repositórios (Spring Data ES / Prisma)
    openweather/             → Cliente HTTP externo (WebClient)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500">
        <p>Diogo Silveira Benício — diogobenicio@hotmail.com</p>
        <p className="mt-1">
          <a href="https://linkedin.com/in/diogosbenicio" className="hover:text-blue-600">
            LinkedIn
          </a>
          {' · '}
          Uberlândia/MG
        </p>
      </footer>
    </main>
  )
}
