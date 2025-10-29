import { auth } from '@/auth';
import CallUpCard from '@/features/CallUp/components/CallUpCard';
import { prisma } from '@/prisma'
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function ConvocationPage() {

const session = await auth.api.getSession({ headers: await headers() });
  const DataRoleUser = await prisma.membreEquipe.findFirst(({
    where : {userId : session?.user.id },
    select : {role : true}
  }))
  
  if (DataRoleUser?.role !== "JOUEUR") redirect("/dashboardfoothub")

  return (
    <div>
      <h1 className='text-xl tracking-tighter'>Convocations pour {session?.user.name} </h1>
      <CallUpCard></CallUpCard>
    </div>
  )
}

export default ConvocationPage