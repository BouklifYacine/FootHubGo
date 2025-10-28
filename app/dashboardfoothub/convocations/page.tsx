import { auth } from '@/auth';
import { prisma } from '@/prisma'
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'

async function ConvocationPage() {

const session = await auth.api.getSession({ headers: await headers() });
  const DataRoleUser = await prisma.membreEquipe.findFirst(({
    where : {userId : session?.user.id },
    select : {role : true}
  }))

  if (DataRoleUser?.role !== "JOUEUR") redirect("/dashboardfoothub")

  return (
    <div>Page de convocation</div>
  )
}

export default ConvocationPage