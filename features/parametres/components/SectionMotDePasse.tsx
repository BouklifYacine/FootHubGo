'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputPassword } from './InputPassword'
import { useMotDePasse } from '../hooks/useMotDePasse'

export function SectionMotDePasse() {
  const {
    etape,
    enEdition,
    setEnEdition,
    formVerification,
    formChangement,
    verifierMotDePasseMutation,
    changerMotDePasseMutation,
    reinitialiser
  } = useMotDePasse()

  if (!enEdition) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Mot de passe</h2>
            <p className="text-sm text-gray-500">Modifiez votre mot de passe</p>
          </div>
          <Button onClick={() => setEnEdition(true)}>
            Modifier
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {etape === 'verification' && (
          <form 
            onSubmit={formVerification.handleSubmit((data) => 
              verifierMotDePasseMutation.mutate(data.motdepasse)
            )} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="motdepasse">Mot de passe actuel</Label>
              <InputPassword
               
                {...formVerification.register('motdepasse')}
              />
              {formVerification.formState.errors.motdepasse && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formVerification.formState.errors.motdepasse.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                disabled={verifierMotDePasseMutation.isPending}
              >
                {verifierMotDePasseMutation.isPending 
                  ? "Vérification..." 
                  : "Continuer"
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={reinitialiser}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}

        {etape === 'changement' && (
          <form 
            onSubmit={formChangement.handleSubmit((data) => 
              changerMotDePasseMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="motdepasse">Nouveau mot de passe</Label>
              <InputPassword
                {...formChangement.register('motdepasse')}
              />
              {formChangement.formState.errors.motdepasse && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formChangement.formState.errors.motdepasse.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeverification">Code de vérification</Label>
              <Input
                id="codeverification"
                {...formChangement.register('codeverification')}
                placeholder="Entrez le code reçu par email"
              />
              {formChangement.formState.errors.codeverification && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {formChangement.formState.errors.codeverification.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit"
                disabled={changerMotDePasseMutation.isPending}
              >
                {changerMotDePasseMutation.isPending 
                  ? "Modification en cours..." 
                  : "Changer le mot de passe"
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={reinitialiser}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}