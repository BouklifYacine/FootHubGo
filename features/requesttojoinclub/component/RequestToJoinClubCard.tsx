"use client"
import { useGetRequestToJoinClub } from '../hooks/UseGetRequestToJoinClubUser'

function RequestToJoinClubCard() {

  const {data, isPending} = useGetRequestToJoinClub()
  console.log(data)

  return (
    <div>RequestToJoinClubCard</div>
  )
}

export default RequestToJoinClubCard