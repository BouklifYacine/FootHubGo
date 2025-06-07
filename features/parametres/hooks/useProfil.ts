import { useQuery } from "@tanstack/react-query"

interface UserCompleteData {
  email: string
  pseudo: string
  plan: 'free' | 'pro'
  image: string | null
  abonnement: {
    periode: 'mois' | 'année'
    datedebut: string
    datefin: string
  } | null
  providerId: string[]
}

export function useProfil (userId : string){
   return useQuery<UserCompleteData>({
        queryKey: ['profil', userId],
        queryFn: async () => {
          const response = await fetch(`/api/user/accounts?userId=${userId}`)
          if (!response.ok) 
            throw new Error('Échec de la récupération des données utilisateur')
          return response.json()
        }
      })
}