'use client'

import { NpsForm } from '@/components/nps/NpsForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loadingspinner'
import { useNpsSummary } from '@/hooks/useNpsSummary'
import { useNpsResponses } from '@/hooks/useNpsResponses'
import { getNpsZoneColor, getNpsZoneBg } from '@/lib/utils/npsUtils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PageContainer } from '@/components/layout/PageContainer'
import { User, Trash2 } from 'lucide-react'
import { useDeleteNpsResponse } from '@/hooks/useDeleteNpsResponse'

export default function NpsPage() {
  const { data: summary, isLoading } = useNpsSummary('portfolio')
  const { data: responses } = useNpsResponses('portfolio', 20)
  const { mutate: deleteResponse, isPending: isDeleting } = useDeleteNpsResponse()

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Avalie o Portfólio</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
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
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">NPS Score</p>
                        <p className={`text-5xl font-bold ${getNpsZoneColor(summary.zone)}`}>
                          {summary.npsScore}
                        </p>
                        <p className={`mt-1 text-sm font-medium ${getNpsZoneColor(summary.zone)}`}>
                          Zona: {summary.zone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Total de respostas</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{summary.totalResponses}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/40">
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{summary.promoters}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Promotores</p>
                      </div>
                      <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/40">
                        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{summary.passives}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">Passivos</p>
                      </div>
                      <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/40">
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">{summary.detractors}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Detratores</p>
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
        {/* Avaliações recentes */}
        {responses && responses.data.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-slate-200">Avaliações recentes</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {responses.data.map((item) => {
                const scoreColor =
                  item.score >= 9
                    ? 'text-green-600 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700'
                    : item.score >= 7
                      ? 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700'
                      : 'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700'
                const scoreBg =
                  item.score >= 9
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : item.score >= 7
                      ? 'bg-yellow-50 dark:bg-yellow-900/10'
                      : 'bg-red-50 dark:bg-red-900/10'
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/70 p-6 shadow-md backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60 ${scoreBg}`}
                  >
                    {/* Topo: avatar + nome + data + apagar */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold ${scoreColor}`}
                      >
                        {item.score}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-gray-400 dark:text-slate-500" />
                          <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                            {item.name ?? 'Anônimo'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteResponse(item.id)}
                        disabled={isDeleting}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:text-slate-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Apagar avaliação"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Comentário */}
                    {item.comment && (
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{item.comment}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
