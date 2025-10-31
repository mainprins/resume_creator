import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ResumePreview from '../components/ResumePreview';
import api from '../configs/api';
import { Loader2 } from 'lucide-react';

const Preview = () => {
  const {resumeId} = useParams();
  const [isLoading,setIsLoading] = useState(true);
  const [resumeData,setResumeData] = useState(null);
  const loadResume = async () => {
    try {
       const { data } = await api.get(`/api/resume/public/${resumeId}`, { resumeId: editResumeId, resumeData: {title} }, {
        headers: {
          Authorization: token
        }
      })
      setResumeData(data.resume);
    } catch (error) {
      console.log(error.message);
      
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(()=>{
    loadResume();
  },[])
  return (
    <div>
      {isLoading ? <Loader2 className='animate-spin size-5'/> :    <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color}/>}
    </div>
  )
}

export default Preview