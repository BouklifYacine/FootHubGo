'use client'

import { useState } from 'react'
import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { schemaVerificationMotDePasse, schemaEmail } from '../schemas/schema'
import { toast } from "sonner";
import { TypeEmail } from '../schemas/schema'
import { DeconnexionClient } from '@/lib/FonctionDeconnexionClient'
import { verifierMotDePasse } from '../actions/verifiermotdepasseaction'
import { changerEmail } from '../actions/changeremailaction'
import { definirErreurChamp } from '../lib/definirErreurChamp'

export function useEmail() {
  const [etape, setEtape] = useState<'motdepasse' | 'email'>('motdepasse')
  const [enEdition, setEnEdition] = useState(false)

  const formMotDePasse = useForm({
    defaultValues: {
      motdepasse: ''
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaVerificationMotDePasse },
    onSubmit: ({ value }) => {
      verifierMotDePasseMutation.mutate(value.motdepasse)
    }
  })

  const formEmail = useForm({
    defaultValues: {
      nouvelEmail: '',
      codeverification: ''
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schemaEmail },
    onSubmit: ({ value }) => {
      changerEmailMutation.mutate(value)
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
      definirErreurChamp(formMotDePasse, 'motdepasse', error.message)
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
        definirErreurChamp(formEmail, 'codeverification', error.message)
      } else {
        definirErreurChamp(formEmail, 'nouvelEmail', error.message)
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
