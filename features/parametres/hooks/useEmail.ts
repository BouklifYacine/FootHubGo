'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { schemaVerificationMotDePasse, schemaEmail } from '../schemas/schema'
import toast from 'react-hot-toast'
import { TypeEmail } from '../schemas/schema'
import { DeconnexionClient } from '@/lib/FonctionDeconnexionClient'
import { verifierMotDePasse } from '../actions/verifiermotdepasseaction'
import { changerEmail } from '../actions/changeremailaction'

export function useEmail() {
  const [etape, setEtape] = useState<'motdepasse' | 'email'>('motdepasse')
  const [enEdition, setEnEdition] = useState(false)

  const formMotDePasse = useForm({
    resolver: zodResolver(schemaVerificationMotDePasse),
    defaultValues: {
      motdepasse: ''
    }
  })

  const formEmail = useForm<TypeEmail>({
    resolver: zodResolver(schemaEmail),
    defaultValues: {
      nouvelEmail: '',
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
      toast.success('Code de vérification envoyé par email')
      setEtape('email')
      formMotDePasse.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      formMotDePasse.setError('motdepasse', { message: error.message })
    }
  })

  const changerEmailMutation = useMutation({
    mutationFn: async (data: TypeEmail) => {
      const resultat = await changerEmail(data)
      if (resultat.error) throw new Error(resultat.error)
      return resultat
    },
    onSuccess: () => {
      toast.success('Email modifié avec succès')
      DeconnexionClient()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      if (error.message.includes('Code')) {
        formEmail.setError('codeverification', { message: error.message })
      } else {
        formEmail.setError('nouvelEmail', { message: error.message })
      }
    }
  })

  const reinitialiser = () => {
    setEnEdition(false)
    setEtape('motdepasse')
    formMotDePasse.reset()
    formEmail.reset()
  }

  return {
    etape,
    enEdition,
    setEnEdition,
    formMotDePasse,
    formEmail,
    verifierMotDePasseMutation,
    changerEmailMutation,
    reinitialiser
  }
}