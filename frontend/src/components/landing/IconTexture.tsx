import { Cloud, Wind, Thermometer, MapPin, Droplets, Sun } from 'lucide-react'

const icons = [Cloud, Wind, Thermometer, MapPin, Droplets, Sun]

export function IconTexture() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, 64px)',
          gridTemplateRows: 'repeat(auto-fill, 64px)',
          gap: '8px',
        }}
      >
        {Array.from({ length: 200 }).map((_, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div key={i} className="flex items-center justify-center opacity-[0.04]">
              <Icon size={24} className="text-blue-900" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
