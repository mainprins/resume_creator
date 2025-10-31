import { Check, Palette } from 'lucide-react';
import React, { useState } from 'react'

const AccentSelector = ({ onChange, selectedColor }) => {
    const colors = [
        { id: 'emerald', value: '#27ae60' },
        { id: 'sky', value: '#2980b9' },
        { id: 'slate', value: '#2d3436' },
        { id: 'lavender', value: '#6c5ce7' },
        { id: 'peach', value: '#e17055' },
        { id: 'mint', value: '#00b894' },
        { id: 'sand', value: '#d4a017' },
        { id: 'crimson', value: '#c0392b' },
        { id: 'violet', value: '#8e44ad' },
        { id: 'teal', value: '#16a085' },
        { id: 'orange', value: '#e67e22' },
        { id: 'blue', value: '#2980b9' },
        { id: 'burgundy', value: '#800020' },
        { id: 'charcoal', value: '#34495e' },
        { id: 'olive', value: '#556b2f' },
        { id: 'bronze', value: '#cd7f32' },
        { id: 'indigo', value: '#4b0082' },
        { id: 'ruby', value: '#9b111e' },
    ];



    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='relative'>
            <div onClick={() => setIsOpen(!isOpen)} className='bg-purple-200 text-purple-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer'>
                <Palette size={20} />
                <span className='text-md'>Accent</span>
            </div>

            {isOpen &&
                <div className='absolute w-60 items-center justify-center flex-wrap top-15 flex gap-3 bg-white border border-slate-400 p-3'>
                    {colors.map((color) => (
                        <div key={color.id} className='flex flex-col w-15 h-15 items-center justify-center'>
                            <div className={`w-10 h-10 rounded-full items-center justify-center text-white cursor-pointer flex`} style={{ backgroundColor: color.value }} onClick={() => { onChange(color.value); setIsOpen(false) }}>
                                {selectedColor === color.value && <Check />}
                            </div>
                            <span className='text-sm text-slate-600 itlaic text-center'>{color.id}</span>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}

export default AccentSelector