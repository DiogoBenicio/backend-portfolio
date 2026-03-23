'use client'

import { useState } from 'react'
import { useSubmitNps } from '@/hooks/useSubmitNps'
import { ScoreSelector } from './ScoreSelector'
import { Button } from '@/components/ui/button'
import { NpsThankYou } from './NpsThankYou'

export function NpsForm() {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { mutate, isPending } = useSubmitNps()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (score === null) return
    mutate(
      {
        score,
        comment: comment.trim() || undefined,
        name: name.trim() || undefined,
        page: 'portfolio',
      },
      { onSuccess: () => setSubmitted(true) }
    )
  }

  if (submitted) return <NpsThankYou score={score!} />

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Em uma escala de 0 a 10, o quanto você recomendaria este portfólio para colegas?
        </label>
        <ScoreSelector value={score} onChange={setScore} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Seu nome (opcional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como posso te chamar?"
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="O que achou do portfólio? Sugestões são bem-vindas..."
          rows={3}
          maxLength={1000}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">{comment.length}/1000</p>
      </div>

      <Button type="submit" disabled={score === null || isPending} className="w-full">
        {isPending ? 'Enviando...' : 'Enviar Avaliação'}
      </Button>
    </form>
  )
}
