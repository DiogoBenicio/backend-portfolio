import { useMutation, useQueryClient } from '@tanstack/react-query'
import { npsApi } from '@/lib/api/npsClient'
import type { SubmitNpsInput } from '@/types/nps'

export function useSubmitNps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitNpsInput) => npsApi.submit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nps', 'summary'] })
    },
  })
}
