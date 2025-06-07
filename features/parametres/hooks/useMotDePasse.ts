'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { schemaVerificationMotDePasse, schemaMotDePasse } from '../schemas/schema'
import toast from 'react-hot-toast'
import { TypeMotDePasse } from '../schemas/schema'
import { DeconnexionClient } from '@/lib/FonctionDeconnexionClient'
import { verifierMotDePasse } from '../actions/verifiermotdepasseaction'
import { changerMotDePasse } from '../actions/changermotdepasse'

export function useMotDePasse() {
  const [etape, setEtape] = useState<'verification' | 'changement'>('verification')
  const [enEdition, setEnEdition] = useState(false)

  const formVerification = useForm({
    resolver: zodResolver(schemaVerificationMotDePasse),
    defaultValues: {
      motdepasse: ''
    }
  })

  const formChangement = useForm<TypeMotDePasse>({
    resolver: zodResolver(schemaMotDePasse),
    defaultValues: {
      motdepasse: '',
      codeverification: ''
    }
  })

  const verifierMotDePasseMutation = useMutation({
    mutationFn: async (motdepasse: string) => {
      const resultat = await verifierMotDePasse(motdepasse)
      if (resultat.error) throw new Error(resultat.error)
      return resultat
    },
    onSuccess: () => {
      toast.success("Code de vérification envoyé")
      setEtape('changement')
      formVerification.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      formVerification.setError('motdepasse', { message: error.message })
    }
  })

  const changerMotDePasseMutation = useMutation({
    mutationFn: async (data: TypeMotDePasse) => {
      const resultat = await changerMotDePasse(data)
      if (resultat.error) throw new Error(resultat.error)
      return resultat
    },
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès')
      DeconnexionClient()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      if (error.message.includes('Code')) {
        formChangement.setError('codeverification', { message: error.message })
      } else {
        formChangement.setError('motdepasse', { message: error.message })
      }
    }
  })

  const reinitialiser = () => {
    setEnEdition(false)
    setEtape('verification')
    formVerification.reset()
    formChangement.reset()
  }

  return {
    etape,
    enEdition,
    setEnEdition,
    formVerification,
    formChangement,
    verifierMotDePasseMutation,
    changerMotDePasseMutation,
    reinitialiser
  }
}