import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Cloud, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { IconTexture } from './IconTexture'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-200 to-blue-100 px-6 py-24 dark:from-gray-950 dark:to-gray-900 md:px-16 md:py-32">
      <IconTexture />

      {/* Toggle de tema — canto superior direito */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/60 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 hover:text-gray-900 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700/80 dark:hover:text-gray-100" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-16">
          {/* Foto */}
          <div className="shrink-0">
            <div className="relative h-36 w-36 overflow-hidden rounded-2xl border-4 border-white shadow-xl md:h-44 md:w-44">
              <Image
                src="/images/Diogo.jpg"
                alt="Diogo Silveira Benício"
                fill
                className="object-cover object-[center_25%]"
                priority
              />
            </div>
          </div>

          {/* Informações */}
          <div className="flex-1">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Full Stack Engineer
            </p>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Diogo Silveira Benício
            </h1>
            <p className="mb-6 max-w-xl text-lg text-gray-600 dark:text-gray-300">
              Node.js • React • Java • ElasticSearch
              <br />
              <span className="text-base text-gray-500 dark:text-gray-400">
                Cloud, IoT & Data Platforms — Uberlândia/MG
              </span>
            </p>

            {/* Tags de tecnologia */}
            <div className="mb-8 flex flex-wrap gap-2">
              {[
                'Spring Boot',
                'Node.js',
                'TypeScript',
                'Elasticsearch',
                'AWS',
                'Docker',
                'Next.js',
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/weather">
                <Button className="gap-2">
                  <Cloud size={16} />
                  Dashboard de Clima
                  <ArrowRight size={14} />
                </Button>
              </Link>
              <Link href="/dashboard/map">
                <Button variant="outline" className="gap-2">
                  <MapPin size={16} />
                  Mapa Interativo
                </Button>
              </Link>
              <Link href="/dashboard/nps">
                <Button variant="ghost" className="gap-2">
                  <Star size={16} />
                  Avaliar Portfólio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
