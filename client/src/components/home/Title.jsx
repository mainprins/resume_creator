import React from 'react'

const Title = ({title,desc}) => {
  return (
    <div className='flex flex-col w-100 justify-center items-center gap-5'>
        <h1 className='font-semibold tracking-wider text-slate-700 text-2xl'>{title}</h1>
        <p className='text-center text-slate-600'>{desc}</p>
    </div>
  )
}

export default Title