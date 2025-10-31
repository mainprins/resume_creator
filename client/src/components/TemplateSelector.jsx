import { Check, LayoutPanelTop } from 'lucide-react';
import React, { useState } from 'react'

const TemplateSelector = ({ selectedTemplate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const templates = [{
        id: "classic",
        name: "Classic",
        preview: "A clean,traditional resume format with clear sections and professional typography."
    }, {
        id: "modern",
        name: "Modern",
        preview: "A clean,traditional resume format with clear sections and professional typography."
    }, {
        id: "minimal",
        name: "Minimal",
        preview: "A clean,traditional resume format with clear sections and professional typography."
    }, {
        id: "minimal-image",
        name: "Minimal Image",
        preview: "A clean,traditional resume format with clear sections and professional typography."
    }]
    return (
        <div className='relative'>
            <div onClick={()=>setIsOpen(!isOpen)} className='bg-indigo-200 text-indigo-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer'>
                <LayoutPanelTop size={20} />
                <span className='text-md'>Template</span>
            </div>

            {isOpen && (
                <div className='absolute top-full w-xs p-3 mt-2 space-y-3 z-10 bg-white rounded-md border border-gray-200 shadow-sm'>
                    {templates.map((template)=>(
                        <div key={template.id} onClick={()=>{onChange(template.id); setIsOpen(false)}} className={`relative p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate===template.id ? "border-blue-400 bg-blue-100" : "border-gray-300 hover:border-gray-400 hover:bg-gray-100"}`}>
                            {selectedTemplate === template.id && (
                                <div className='absolute top-2 right-2'>
                                    <div className='size-5 bg-blue-400 rounded-full flex items-center justify-center'>
                                        <Check className='w-3 h-3 text-white'/>
                                    </div>
                                </div>
                            )}

                            <div className='space-y-1'>
                                <h1 className='font-medium text-gray-800'>{template.name}</h1>
                                <div className='mt-2 p-2 bg-blue-50 rounde text-xs text-gray-500 italic'>{template.preview}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TemplateSelector