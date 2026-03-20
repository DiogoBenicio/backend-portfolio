import { CheckCircle2 } from 'lucide-react'
import { getScoreCategory } from '@/lib/utils/npsUtils'
import { Badge } from '@/components/ui/badge'

interface NpsThankYouProps {
  score: number
}

export function NpsThankYou({ score }: NpsThankYouProps) {
  const { label } = getScoreCategory(score)

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <CheckCircle2 size={48} className="text-green-500" />
      <h3 className="text-xl font-bold text-gray-900">Obrigado pelo feedback!</h3>
      <p className="text-gray-500">
        Você avaliou com nota <strong className="text-blue-600">{score}</strong>
      </p>
      <Badge variant={score >= 9 ? 'success' : score >= 7 ? 'warning' : 'destructive'}>
        {label}
      </Badge>
      <p className="mt-2 text-sm text-gray-400">
        Sua avaliação ajuda a melhorar continuamente este portfólio.
      </p>
    </div>
  )
}
