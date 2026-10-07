'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputPassword } from './InputPassword'
import { useSectionPseudo } from "../hooks/UsePseudo"


interface PropsSectionPseudo {
  userId: string
}

export function SectionPseudo({ userId: identifiantUtilisateur }: PropsSectionPseudo) {
  const {
    // États
    estEnEdition,
    etapeActuelle,
    necessiteVerificationMotDePasse,

    formulaireVerification,
    formulaireChangement,

    mutationVerifierMotDePasse,
    mutationChangerPseudo,

    // Actions
    commencerEdition,
    annulerModification,
  } = useSectionPseudo(identifiantUtilisateur)

  // Vue par défaut (non en édition)
  if (!estEnEdition) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Pseudo</h2>
            <p className="text-sm text-gray-500">Changez votre pseudo</p>
          </div>
          <Button onClick={commencerEdition}>Modifier</Button>
        </div>
      </Card>
    )
  }

  // Vue de vérification du mot de passe
  if (necessiteVerificationMotDePasse && etapeActuelle === 'verification') {
    return (
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            formulaireVerification.handleSubmit()
          }}
          className="space-y-4"
        >
          <formulaireVerification.Field name="motdepasse">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="motdepasse">Mot de passe actuel</Label>
                <InputPassword
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {field.state.meta.errors[0]?.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </formulaireVerification.Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={mutationVerifierMotDePasse.isPending}
            >
              {mutationVerifierMotDePasse.isPending ? "Vérification..." : "Continuer"}
            </Button>
            <Button type="button" variant="outline" onClick={annulerModification}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  // Vue de changement du pseudo
  return (
    <Card className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          formulaireChangement.handleSubmit()
        }}
        className="space-y-4"
      >
        <formulaireChangement.Field name="pseudo">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="pseudo">Nouveau pseudo</Label>
              <Input
                id="pseudo"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Entrez votre nouveau pseudo"
              />
              {field.state.meta.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {field.state.meta.errors[0]?.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </formulaireChangement.Field>

        {necessiteVerificationMotDePasse && (
          <formulaireChangement.Field name="codeverification">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="codeverification">Code de vérification</Label>
                <Input
                  id="codeverification"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Entrez le code reçu par email"
                  maxLength={6}
                />
                {field.state.meta.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {field.state.meta.errors[0]?.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </formulaireChangement.Field>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={mutationChangerPseudo.isPending}
          >
            {mutationChangerPseudo.isPending ? "Modification..." : "Changer le pseudo"}
          </Button>
          <Button type="button" variant="outline" onClick={annulerModification}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}
