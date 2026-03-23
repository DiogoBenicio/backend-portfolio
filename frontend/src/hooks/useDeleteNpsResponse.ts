import { useMutation, useQueryClient } from '@tanstack/react-query'
import { npsApi } from '@/lib/api/npsClient'

export function useDeleteNpsResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => npsApi.deleteResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nps-responses'] })
      queryClient.invalidateQueries({ queryKey: ['nps-summary'] })
    },
  })
}
