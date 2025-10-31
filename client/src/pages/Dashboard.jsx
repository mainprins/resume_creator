import { Edit, FileUser, Plus, Trash, Upload, UploadCloud, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dummyResumeData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux"
import api from '../configs/api';
import toast from 'react-hot-toast';
import pdfToText from "react-pdftotext"

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(false);
  const [allResumes, setAllResumes] = useState(null);
  const [editResumeId, setEditResumeId] = useState(null);
  const [title, setTitle] = useState('');
  const [openResumeDialog, setOpenResumeDialog] = useState(false);
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();
  const [openUploadResumeDialog, setOpenUploadResumeDialog] = useState(false);
  const colors = [
    // Light Greens
    '#90EE90', // LightGreen
    '#ADFF2F', // GreenYellow
    '#32CD32', // LimeGreen (lighter variant)

    // Light Purples
    '#E6E6FA', // Lavender
    '#D8BFD8', // Thistle
    '#DDA0DD', // Plum
    '#EE82EE', // Violet
    '#DA70D6', // Orchid
  ];


  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/resume/userResumes', {
        headers: {
          Authorization: token
        }
      })
      setAllResumes(data.resumes);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);

    }
  }

  useEffect(() => {
    loadAllResumes();
  }, [])


  const createResume = async (e) => {
    try {
      e.preventDefault();
      const { data } = await api.post('/api/resume/create', { title }, {
        headers: {
          Authorization: token
        }
      })
      setAllResumes([...allResumes, data.resume])
      setTitle('')
      setOpenResumeDialog(false);
      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  const uploadResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!resume) {
        toast.error("Please select a PDF file");
        return;
      }

      console.log(resume);
      

      const resumeText = await pdfToText(resume);
      console.log(resumeText);

      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, {
        headers: {
          Authorization: token
        }
      })
      setTitle('')
      setResume(null)
      setOpenUploadResumeDialog(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error.message);

    }
  }

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm("Do you surely want to delete this resume ?")
      if (confirm) {
        const { data } = await api.delete(`/api/resume/delete/${resumeId}`, {
          headers: {
            Authorization: token
          }
        })
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId))
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }

  }

  const editTitle = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append('resumeId', editResumeId);
      formData.append('resumeData', JSON.stringify({ title }))
      const { data } = await api.put('/api/resume/update', formData, {
        headers: {
          Authorization: token
        }
      })
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('');
      setEditResumeId(null);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  return (
    <div className='flex flex-col gap-6 px-4 md:px-8 xl:px-12 2xl:px-16'>
      <div id="top" className={`mt-10 flex gap-3 cursor-pointer`}>
        <div className='flex flex-col border-dotted hover:scale-105 hover:border-slate-600 transition-all duration-500 border-2 border-slate-400 justify-center w-60 min-h-50 gap-3 shadow-md items-center' onClick={() => { setOpenResumeDialog(true) }}>
          <div className='bg-green-300 rounded-full p-3'><Plus size={30} /></div>
          <span className='text-slate-600 tracking-wider text-md'>Create Resume</span>
        </div>
        <div className='flex flex-col border-dotted border-2 hover:border-slate-600 hover:scale-105 transition-all duration-500 border-slate-400 justify-center w-60 min-h-50 gap-3 shadow-md items-center' onClick={() => { setOpenUploadResumeDialog(true) }}>
          <div className='bg-purple-300 rounded-full p-3'><Upload size={30} /></div>
          <span className='text-slate-600 tracking-wider text-md text-center'>Upload Existing (Note: Pdf should be text-based)</span>
        </div>
      </div>

      <hr className={`w-125 text-slate-300`}></hr>

      <div id='bottom' className={`flex gap-3`}>
        {allResumes?.map((resume, index) => {
          const baseColor = colors[index % colors.length];

          return (
            <div className='flex flex-col group relative rounded-md gap-6 w-60 min-h-50 items-center justify-center' style={{
              background: `linear-gradient(to bottom right, white, ${baseColor}, white)`
            }} key={resume._id}>
              <div id="upper" className='h-[50%] flex flex-col justify-center items-center gap-2' onClick={() => { navigate(`/app/builder/${resume._id}`) }}>
                <div className='rounded-full p-3 shadow-sm'><FileUser size={30} color='black' /></div>
                <span>{resume.title}</span>
              </div>

              <span className='text-slate-600 text-sm'>Updated on {new Date(resume.updatedAt).toLocaleDateString()}</span>

              <div className='absolute top-2 right-2 hidden items-center group-hover:flex group-hover:gap-2 transition-all duration-500'>
                <Trash size={20} className='cursor-pointer hover:text-red-900 transition-all duration-500' onClick={() => { deleteResume(resume._id) }} />
                <Edit size={20} className='cursor-pointer' onClick={() => { setEditResumeId(resume._id) }} />
              </div>
            </div>
          )
        })}
      </div>

      {openResumeDialog &&
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
            onClick={() => setOpenResumeDialog(false)}
          ></div>
          <form onSubmit={createResume} className="bg-white z-50 text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10 fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500">

            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Create Your Resume</h2>

            <label htmlFor="title">Title</label>

            <input id="title" className="w-full border mt-1 border-gray-500/30 focus:border-green-500 outline-none rounded py-2.5 px-4" type="text" onChange={(e) => { setTitle(e.target.value) }} placeholder="Enter resume's title" />

            <button type="submit" className="w-full my-3 bg-green-800 active:scale-95 transition py-2.5 rounded text-white">Create resume</button>

            <X className='absolute right-2 top-2 cursor-pointer hover:text-slate-800' onClick={() => { setOpenResumeDialog(false) }} />

          </form>
        </>
      }

      {editResumeId &&
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
            onClick={() => setEditResumeId(null)}
          ></div>
          <form onSubmit={editTitle} className="bg-white z-50 text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10 fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500">

            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Edit Resume Title</h2>

            <label htmlFor="title">Title</label>

            <input id="title" className="w-full border mt-1 border-gray-500/30 focus:border-green-500 outline-none rounded py-2.5 px-4" type="text" onChange={(e) => { setTitle(e.target.value) }} placeholder="Enter resume's title" />

            <button type="submit" className="w-full my-3 bg-green-800 active:scale-95 transition py-2.5 rounded text-white">Edit resume</button>

            <X className='absolute right-2 top-2 cursor-pointer hover:text-slate-800' onClick={() => { setEditResumeId(null) }} />

          </form>
        </>
      }


      {openUploadResumeDialog &&
        <>
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
            onClick={() => setOpenUploadResumeDialog(false)}
          ></div>
          <form onSubmit={uploadResume} className="bg-white z-50 text-gray-500 max-w-96 mx-4 md:p-6 p-4 text-left text-sm rounded shadow-[0px_0px_10px_0px] shadow-black/10 fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-500">

            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Upload Your Resume</h2>
            <label htmlFor="title">Title</label>

            <input id="title" className="w-full border mt-1 border-gray-500/30 focus:border-green-500 outline-none rounded py-2.5 px-4" type="text" onChange={(e) => { setTitle(e.target.value) }} placeholder="Enter resume's title" />

            <label htmlFor="resume-upload" className='w-full h-full'>
              <div className='bg-slate-200 w-full flex items-center mt-3 justify-center min-h-30'>
                {resume ? typeof resume === 'object' && resume.name ? resume.name : resume.title :
                  <div className='flex flex-col items-center cursor-pointer justify-center'>
                    <UploadCloud />
                    <span className='text-center w-50'>Upload a resume (Note: pdf should be text-based)</span>
                  </div>
                }
              </div>
            </label>

            <input id="resume-upload" type='file' className="hidden" accept='.pdf' onChange={(e) => { setResume(e.target.files[0]) }} />

            <button type="submit" className="w-full my-3 bg-green-800 active:scale-95 transition py-2.5 rounded text-white">{isLoading ? "Uploading..." : "Upload"}</button>

            <X className='absolute right-2 top-2 cursor-pointer hover:text-slate-800' onClick={() => { setOpenUploadResumeDialog(false) }} />

          </form>
        </>
      }




    </div>
  )
}

export default Dashboard