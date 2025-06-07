import React from 'react'
import { Loader } from "@/components/ui/loader"

function SpinnerComponent() {
  return (
    <>
    {/* Dans le variant on peut avoir plusieurs variant pour le design du spinner */}
    <Loader variant="circular" />
    </>
  )
}

export default SpinnerComponent