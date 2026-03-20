import { Card, CardContent } from '@/components/ui/Card'

const projects = [
  {
    title: 'Weather API',
    description:
      'API Java Spring Boot 3 com arquitetura hexagonal. Consulta OpenWeather API e armazena dados históricos no Elasticsearch 8.',
    tech: ['Java 21', 'Spring Boot 3', 'Elasticsearch 8', 'WebClient', 'Docker'],
    color: 'bg-orange-50 border-orange-200',
    accent: 'text-orange-600',
  },
  {
    title: 'NPS API',
    description:
      'Sistema de avaliação NPS em Node.js com arquitetura hexagonal. Fastify 4, TypeScript e PostgreSQL via Prisma ORM.',
    tech: ['Node.js 20', 'TypeScript', 'Fastify 4', 'Prisma', 'PostgreSQL'],
    color: 'bg-green-50 border-green-200',
    accent: 'text-green-600',
  },
  {
    title: 'Portfolio Frontend',
    description:
      'Landing page + dashboard com visualizações de clima (Recharts), mapa interativo (Leaflet/OpenStreetMap) e formulário NPS.',
    tech: ['Next.js 14', 'shadcn/ui', 'Tailwind', 'Recharts', 'Leaflet'],
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-600',
  },
]

export function TechStackSection() {
  return (
    <section className="bg-white px-6 py-16 md:px-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-3 text-2xl font-bold text-gray-900">Projetos</h2>
        <p className="mb-10 text-gray-500">
          Três projetos interconectados usando arquitetura hexagonal (Ports & Adapters).
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.title} className={`border ${p.color}`}>
              <CardContent className="p-6">
                <h3 className={`mb-2 font-semibold ${p.accent}`}>{p.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{p.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
