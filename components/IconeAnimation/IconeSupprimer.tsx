"use client"
import * as React from "react"
import { AnimatedTrashIcon } from "../ui/trash-icon"


export function IconeSupprimer() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <AnimatedTrashIcon size={64} variant="animated" className="transition-all" />
    </div>
  )
}
