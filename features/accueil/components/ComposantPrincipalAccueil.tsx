"use client"
import React from 'react'
import { UseDataAccueil } from '../hooks/UseDataAccueil'

function ComposantPrincipalAccueil() {

  const {data, isLoading} = UseDataAccueil()
  console.log(data)
  return (
    <div>ComposantPrincipal</div>
  )
}

export default ComposantPrincipalAccueil