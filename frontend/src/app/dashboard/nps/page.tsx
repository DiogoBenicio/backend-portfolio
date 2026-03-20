'use client'

import { NpsForm } from '@/components/nps/NpsForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loadingspinner'
import { useNpsSummary } from '@/hooks/useNpsSummary'
import { getNpsZoneColor, getNpsZoneBg } from '@/lib/utils/npsUtils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function NpsPage() {
  const { data: summary, isLoading } = useNpsSummary('portfolio')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avalie o Portfólio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Net Promoter Score — ajude a melhorar este portfólio com sua avaliação
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Sua Avaliação</CardTitle>
            <CardDescription>
              O quanto você recomendaria este portfólio para colegas desenvolvedores?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NpsForm />
          </CardContent>
        </Card>

        {/* Painel de resultados */}
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner label="Carregando resultados NPS..." />
          ) : summary ? (
            <>
              {/* Score principal */}
              <Card className={`border ${getNpsZoneBg(summary.zone)}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NPS Score</p>
                      <p className={`text-5xl font-bold ${getNpsZoneColor(summary.zone)}`}>
                        {summary.npsScore}
                      </p>
                      <p className={`mt-1 text-sm font-medium ${getNpsZoneColor(summary.zone)}`}>
                        Zona: {summary.zone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total de respostas</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.totalResponses}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-green-100 p-2">
                      <p className="text-lg font-bold text-green-700">{summary.promoters}</p>
                      <p className="text-xs text-green-600">Promotores</p>
                    </div>
                    <div className="rounded-lg bg-yellow-100 p-2">
                      <p className="text-lg font-bold text-yellow-700">{summary.passives}</p>
                      <p className="text-xs text-yellow-600">Passivos</p>
                    </div>
                    <div className="rounded-lg bg-red-100 p-2">
                      <p className="text-lg font-bold text-red-700">{summary.detractors}</p>
                      <p className="text-xs text-red-600">Detratores</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(summary.distribution).map(([score, count]) => ({
                          score: Number(score),
                          count,
                        }))}
                        margin={{ top: 0, right: 5, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="count" name="Respostas" radius={[3, 3, 0, 0]}>
                          {Object.keys(summary.distribution).map((score) => {
                            const s = Number(score)
                            const color = s >= 9 ? '#22c55e' : s >= 7 ? '#eab308' : '#ef4444'
                            return <Cell key={score} fill={color} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
