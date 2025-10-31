import React from 'react'
import {EvCharger} from "lucide-react"

const Badge = ({title}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-green-800 bg-green-400/10 border border-green-200 rounded-full px-4 py-1">

    <EvCharger size={20} color='#27a567'/>

    <span>{title}</span>

</div>
  )
}

export default Badge