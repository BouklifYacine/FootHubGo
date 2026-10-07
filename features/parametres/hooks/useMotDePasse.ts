'use client'

import { useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { schemaVerificationMotDePasse, schemaMotDePasse } from '../schemas/schema'
import { toast } from "sonner";
import { TypeMotDePasse } from '../schemas/schema'
import { DeconnexionClient } from '@/lib/FonctionDeconnexionClient'
import { verifierMotDePasse } from '../actions/verifiermotdepasseaction'
import { changerMotDePasse } from '../actions/changermotdepasse'
import { definirErreurChamp } from '../lib/definirErreurChamp'

export function useMotDePasse() {
  const [etape, setEtape] = useState<'verification' | 'changement'>('verification')
  const [enEdition, setEnEdition] = useState(false)

  const formVerification = useForm({
    defaultValues: {
      motdepasse: ''
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaVerificationMotDePasse },
    onSubmit: ({ value }) => {
      verifierMotDePasseMutation.mutate(value.motdepasse)
    }
  })

  const formChangement = useForm({
    defaultValues: {
      motdepasse: '',
      codeverification: ''
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaMotDePasse },
    onSubmit: ({ value }) => {
      changerMotDePasseMutation.mutate(value)
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
      definirErreurChamp(formVerification, 'motdepasse', error.message)
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
        definirErreurChamp(formChangement, 'codeverification', error.message)
      } else {
        definirErreurChamp(formChangement, 'motdepasse', error.message)
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
