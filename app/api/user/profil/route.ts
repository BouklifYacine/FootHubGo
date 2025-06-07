// app/api/user/profile/route.ts
import { prisma } from '@/prisma'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId est requis' },
        { status: 400 }
      )
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        abonnement: {
          select: {
            periode: true,
            datedebut: true,
            datefin: true,
          }
        }
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}