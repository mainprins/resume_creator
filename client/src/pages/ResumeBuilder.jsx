import { ArrowLeft, ArrowRight, Book, Briefcase, DownloadIcon, Earth, Eye, EyeOffIcon, Folder, LayoutPanelTop, Link, Loader2, Mail, MapIcon, Palette, Phone, Plus, School, Share2Icon, Star, StarIcon, Trash, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom"
import ResumePreview from '../components/ResumePreview';
import TemplateSelector from '../components/TemplateSelector';
import AccentSelector from '../components/AccentSelector';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../configs/api';

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth)
  const [removeBackground, setRemoveBackground] = useState(false);
  const [isGeneratingProfSum, setIsGeneratingProfSum] = useState(false);
  const [isGeneratingJobDesc, setIsGeneratingJobDesc] = useState(false);
  const [experienceFormCount, setExperienceFormCount] = useState(0);
  const [skill, setSkill] = useState('');
  const forms = Array.from({ length: experienceFormCount });
  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: '',
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: 'classic',
    accent_color: '#3B82F6',
    public: false,

  })
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [isPresentChecked, setIsPresentChecked] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const sections = [1, 2, 3, 4, 5, 6];

  const goToPrevious = () => {
    if (currentSection !== 0) {
      setCurrentSection(prev => prev - 1)
    }

  }

  const goToNext = () => {
    if (currentSection !== 5) {
      setCurrentSection(prev => prev + 1)
    }

  }

  const generateProfSum = async () => {
    try {
      setIsGeneratingProfSum(true);
      const prompt = `enhance my professional summary ${resumeData.professional_summary}`
      const response = await api.post('/api/ai/enhance-prof-summary', { userContent: prompt }, {
        headers: {
          Authorization: token
        }
      })
      setResumeData(prev => ({ ...prev, professional_summary: response.data.enhancedContent }))
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsGeneratingProfSum(false)
    }
  }


  const generateJobDesc = async (index) => {
    try {
      setIsGeneratingJobDesc(true);
      const prompt = `enhance my job description ${resumeData.experience[index].description} for the position of ${resumeData.experience[index].position} at ${resumeData.experience[index].company}`
      const response = await api.post('/api/ai/enhance-job-description', { userContent: prompt }, {
        headers: {
          Authorization: token
        }
      })
      const updatedExperience = [...(resumeData.experience || [])];
      updatedExperience[index] = { ...updatedExperience[index], description: response.data.enhancedContent };
      setResumeData(prev => ({ ...prev, experience: updatedExperience }))
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsGeneratingJobDesc(false)
    }
  }

  const handleAddSkills = () => {
    if (!skill) return;
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
    setSkill('');
  }

  const handleRemoveSkill = (skillName) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillName)
    }));
  };

  const toggleVisibility = async () => {
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify({ public: !resumeData.public }))

      const { data } = await api.put('/api/resume/update', formData, {
        headers: {
          Authorization: token
        }
      })
      setResumeData({ ...resumeData, public: !resumeData.public })
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  const shareResume = async () => {
    const baseUrl = window.location.origin;
    const shareUrl = baseUrl + `/view/123`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out your resume !!",
          text: "You resume is live !",
          url: shareUrl
        })
      } catch (error) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser");
    }

  }

  const downloadResume = () => {
    window.print();
  }

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData);

      if (typeof resumeData.personal_info.image === 'object') {
        console.log("It's type is object");

        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData();
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify(updatedResumeData))
      removeBackground && formData.append("removeBackground", "yes")
      typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)



      const { data } = await api.put('/api/resume/update', formData, {
        headers: {
          Authorization: token
        }
      })

      setResumeData(data.resume)
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev, experience: [...prev.experience, {
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        description: "",
      }]
    }))
  }

  const addProject = () => {
    setResumeData(prev => ({
      ...prev, project: [...prev.project, {
        name: "",
        type: "",
        description: "",
      }]
    }))
  }

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev, education: [...prev.education, {
        institution: "",
        degree: "",
        graduation_date: "",
        field: "",
        gpa: "",
      }]
    }))
  }

  const removeEntity = (type, index) => {
    setResumeData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  }

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resume/get/${resumeId}`, {
        headers: {
          Authorization: token
        }
      })
      if (data.resume) {
        setResumeData(data.resume)
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message);

    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeData((prev) => ({
      ...prev,
      personal_info: {
        ...prev.personal_info,
        image: file
      }
    }));
  };


  useEffect(() => {
    if (currentSection === 0) {
      setShowPrevButton(false);
    } else if (currentSection === 5) {
      setShowNextButton(false)
    } else {
      setShowPrevButton(true);
      setShowNextButton(true)
    }
  }, [currentSection])

  useEffect(() => {
    loadExistingResume();
  }, [])

  return (
    <div className='px-4 md:px-8 xl:px-12 2xl:px-16 flex flex-col justify-center py-3 shadow-sm'>
      <div className='flex gap-2 items-center mt-3 mb-3 cursor-pointer' onClick={() => { navigate('/app') }}>
        <ArrowLeft className='text-slate-600' size={20} />
        <span className='text-slate-600'>Back to Dashboard</span>
      </div>
      <div id="mainPart" className='flex w-full'>
        <div id="left" className='shadow-sm w-1/2 flex flex-col gap-3'>
          {/* PROGRESS BAR */}
          <div className='w-full h-1 bg-slate-300'>
            <hr className={` bg-green-300 h-full border-none`} style={{ width: `${(currentSection / (sections.length - 1)) * 100}%` }} />
          </div>

          {/* TOGGLE NEXT AND PREVIOUS */}

          <div className='flex justify-between w-full h-15 px-5'>
            <div className='flex gap-3 items-center'>
              <TemplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData((prev) => ({ ...prev, template }))} />
              <AccentSelector selectedColor={resumeData.accent_color} onChange={(color) => setResumeData((prev) => ({ ...prev, accent_color: color }))} />
            </div>
            <div className='flex items-center gap-3'>
              {showPrevButton && <div className='flex gap-2 items-center mt-3 mb-3 cursor-pointer' onClick={goToPrevious}>
                <ArrowLeft className='text-slate-600' size={20} />
                <span className='text-slate-600'>Previous</span>
              </div>}

              {showNextButton && <div className='flex gap-2 items-center mt-3 mb-3 cursor-pointer' onClick={goToNext}>
                <span className='text-slate-600'>Next</span>
                <ArrowRight className='text-slate-600' size={20} />
              </div>}
            </div>



          </div>

          <hr className='px-5 text-slate-200' />

          {currentSection === 0 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div>
                <h1 className='font-semibold tracking-wider'>Personal Information</h1>
                <span className='text-sm text-slate-600'>Get started with the personal information</span>
              </div>

              <div className='flex items-center gap-5 mt-3 mb-3 '>
                <label htmlFor="image-add-user" >
                  <figure className='border-1 border-slate-900 w-15 h-15 rounded-full overflow-hidden flex items-center justify-center'>
                    {resumeData.personal_info.image ? (
                      <img
                        src={
                          (typeof resumeData.personal_info.image === 'string'
                            ? resumeData.personal_info.image
                            : URL.createObjectURL(resumeData.personal_info.image))
                        }
                        alt="User"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="text-slate-600" size={30} />
                    )}
                  </figure>

                </label>
                {resumeData.personal_info.image ? <div>
                  {typeof resumeData.personal_info.image === 'object' && <div className='flex items-center gap-2'>
                    <input type="checkbox" checked={removeBackground}
                      onChange={() => setRemoveBackground(!removeBackground)} />
                    <span className='text-slate-600 text-md'>Remove background</span>
                  </div>}

                </div> : <span className='text-slate-600 text-md'>Upload user image</span>}
                <input type="file" id='image-add-user' accept='image/*' hidden onChange={handleImageUpload} />
              </div>




              <form action="" className='flex flex-col gap-4'>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <User className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Full Name</label>
                  </div>
                  <input type="text" placeholder='Enter your full name' value={resumeData.personal_info.full_name || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        full_name: e.target.value
                      }
                    })
                  }
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <Mail className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Email Address</label>
                  </div>
                  <input type="email" placeholder='Enter your email address' value={resumeData.personal_info.email || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        email: e.target.value
                      }
                    })
                  }
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <Phone className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Phone Number</label>
                  </div>
                  <input type="text" placeholder='Enter your phone number' value={resumeData.personal_info.phone || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        phone: e.target.value
                      }
                    })
                  }
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <MapIcon className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Location</label>
                  </div>
                  <input type="text" placeholder='Enter your location' value={resumeData.personal_info.location || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        location: e.target.value
                      }
                    })
                  }
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <School className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Profession</label>
                  </div>
                  <input type="text" placeholder='Enter your profession' value={resumeData.personal_info.profession || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        profession: e.target.value
                      }
                    })
                  }
                  />
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <Link className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>LinkedIn Profile</label>
                  </div>
                  <input type="text" placeholder='Enter your linkedin profile' value={resumeData.personal_info.linkedin || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        linkedin: e.target.value
                      }
                    })
                  }
                  />
                </div>

                <div className='flex flex-col gap-3'>
                  <div className='flex gap-2 items-center'>
                    <Earth className='text-slate-600' size={20} />
                    <label className='text-slate-600 text-md'>Personal Website</label>
                  </div>
                  <input type="text" placeholder='Enter your personal website' value={resumeData.personal_info.website || ''} className='border-2 text-slate-500 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personal_info: {
                        ...resumeData.personal_info,
                        website: e.target.value
                      }
                    })
                  }
                  />
                </div>

              </form>
            </div>
          }

          {currentSection === 1 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='font-semibold tracking-wider'>Professional Summary</h1>
                  <span className='text-sm text-slate-600'>Add summary for your resume here</span>
                </div>
                <button className='bg-purple-200 text-purple-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer' onClick={generateProfSum} disabled={isGeneratingProfSum}>
                  {isGeneratingProfSum ? <Loader2 className='size-4 animate-spin' /> : <Star size={20} />}
                  <span className='text-md'>{isGeneratingProfSum ? "Enhancing ..." : "AI enhance"}</span>
                </button>
              </div>
              <textarea name="" placeholder='Write an atrractive professional summary that describes your career strength ....' id="" value={resumeData.professional_summary || ''} className='resize-none border-2 text-slate-500 min-h-40 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => ({ ...prev, professional_summary: e.target.value }))}></textarea>
              <span className='text-center w-full text-slate-600 text-sm'>Tip: Highlight key skills and achievements in 2–4 lines showing your value.</span>
            </div>
          }

          {currentSection === 2 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='font-semibold tracking-wider'>Professional Experience</h1>
                  <span className='text-sm text-slate-600'>Add your job experience</span>
                </div>
                <div className='bg-green-200 text-green-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer' onClick={() => addExperience()}>
                  <Plus size={20} />
                  <span className='text-md'>Add Experience</span>
                </div>
              </div>
              {resumeData.experience?.length !== 0 ? <div>
                {resumeData.experience?.map((experience, index) => (
                  <form action="" className='flex flex-col gap-3 w-full' key={index}>
                    <div className='flex justify-between'>
                      <label className='text-xl tracking-wide'>Experience #{index + 1}</label>
                      <Trash size={20} className='text-red-500 cursor-pointer' onClick={() => removeEntity("experience", index)} />
                    </div>
                    <div className='w-full flex flex-col gap-3'>
                      <div className='w-full flex justify-between'>
                        <input type="text" placeholder='Company Name' value={experience.company || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedExperience = [...(prev.experience || [])];
                          updatedExperience[index] = { ...updatedExperience[index], company: e.target.value };
                          return { ...prev, experience: updatedExperience };
                        })} />
                        <input type="text" placeholder='Job Title' value={experience.position || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedExperience = [...(prev.experience || [])];
                          updatedExperience[index] = { ...updatedExperience[index], position: e.target.value };
                          return { ...prev, experience: updatedExperience };
                        })} />
                      </div>
                      <div className='w-full flex justify-between'>
                        <input type="date" value={experience.start_date || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedExperience = [...(prev.experience || [])];
                          updatedExperience[index] = { ...updatedExperience[index], start_date: e.target.value };
                          return { ...prev, experience: updatedExperience };
                        })} />
                        <input type="date" value={experience.end_date || ''} className={`disabled:bg-slate-200 border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md`} disabled={experience.is_current} onChange={(e) => setResumeData((prev) => {
                          const updatedExperience = [...(prev.experience || [])];
                          updatedExperience[index] = { ...updatedExperience[index], end_date: e.target.value };
                          return { ...prev, experience: updatedExperience };
                        })} />
                      </div>
                      <div className='flex gap-2 items-center text-slate-600'>
                        <input
                          type="checkbox"
                          checked={experience.is_current || false}
                          onChange={(e) => {
                            const updatedExperience = [...resumeData.experience];
                            updatedExperience[index] = {
                              ...updatedExperience[index],
                              is_current: e.target.checked,
                              end_date: e.target.checked ? "" : updatedExperience[index].end_date
                            };
                            setResumeData(prev => ({ ...prev, experience: updatedExperience }));
                          }}
                        />   
                        <label className='font-light'>Currently working here</label>
                      </div>
                      <div className='flex justify-between items-center'>
                        <div>
                          <h1 className='font-semibold tracking-wider'>Job Description</h1>
                          <span className='text-sm text-slate-600'>Add a short job description</span>
                        </div>
                        <button className='bg-purple-200 text-purple-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer' onClick={(e) => { e.preventDefault(); generateJobDesc(index) }}>
                          {isGeneratingJobDesc ? <Loader2 className='size-4 animate-spin' /> : <Star size={15} />}
                          <span className='text-sm'>{isGeneratingJobDesc ? "Enhancing ..." : "Enhance with AI"}</span>
                        </button>
                      </div>
                      <textarea name="" value={experience.description || ''} placeholder='Describe your key responsibilities and achievements...' id="" className='resize-none border-2 text-slate-500 min-h-40 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                        const updatedExperience = [...(prev.experience || [])];
                        updatedExperience[index] = { ...updatedExperience[index], description: e.target.value };
                        return { ...prev, experience: updatedExperience };
                      })}></textarea>
                    </div>

                  </form>
                ))}
              </div> : <div className='flex items-center justify-center flex-col gap-3 p-3'>
                <Briefcase className='text-slate-400' size={35} />
                <div className='flex flex-col gap-1'>
                  <span className='text-slate-600'>No job experience added yet.</span>
                  <span className='text-slate-600 text-sm'>Click "Add Experience" to get started.</span>
                </div>
              </div>}

            </div>
          }

          {currentSection === 3 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='font-semibold tracking-wider'>Education</h1>
                  <span className='text-sm text-slate-600'>Add your education details</span>
                </div>
                <div className='bg-green-200 text-green-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer' onClick={() => addEducation()}>
                  <Plus size={20} />
                  <span className='text-md'>Add Education</span>
                </div>
              </div>
              {resumeData.education?.length !== 0 ? <div>
                {resumeData.education?.map((education, index) => (
                  <form action="" className='flex flex-col gap-3 w-full'>
                    <div className='flex justify-between'>
                      <label className='text-xl tracking-wide'>Education #{index + 1}</label>
                      <Trash size={20} className='text-red-500 cursor-pointer' onClick={() => removeEntity("education", index)} />
                    </div>
                    <div className='w-full flex flex-col gap-3'>
                      <div className='w-full flex justify-between'>
                        <input type="text" value={education.institution || ''} placeholder='Institution Name' className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedEducation = [...(prev.education || [])];
                          updatedEducation[index] = { ...updatedEducation[index], institution: e.target.value };
                          return { ...prev, education: updatedEducation };
                        })} />
                        <input type="text" placeholder='Degree' value={education.degree || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedEducation = [...(prev.education || [])];
                          updatedEducation[index] = { ...updatedEducation[index], degree: e.target.value };
                          return { ...prev, education: updatedEducation };
                        })} />
                      </div>
                      <div className='w-full flex justify-between'>
                        <input type="text" placeholder='Field Of Study' value={education.field || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedEducation = [...(prev.education || [])];
                          updatedEducation[index] = { ...updatedEducation[index], field: e.target.value };
                          return { ...prev, education: updatedEducation };
                        })} />
                        <input type="date" value={education.graduation_date || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedEducation = [...(prev.education || [])];
                          updatedEducation[index] = { ...updatedEducation[index], graduation_date: e.target.value };
                          return { ...prev, education: updatedEducation };
                        })} />
                      </div>
                      <div className='w-full flex justify-between'>
                        <input type="text" placeholder='GPA(Optional)' value={education.gpa || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedEducation = [...(prev.education || [])];
                          updatedEducation[index] = { ...updatedEducation[index], gpa: e.target.value };
                          return { ...prev, education: updatedEducation };
                        })} />
                      </div>


                    </div>

                  </form>
                ))}
              </div> : <div className='flex items-center justify-center flex-col gap-3 p-3'>
                <Book className='text-slate-400' size={35} />
                <div className='flex flex-col gap-1'>
                  <span className='text-slate-600'>No educational info added.</span>
                  <span className='text-slate-600 text-sm'>Click "Add Education" to get started.</span>
                </div>
              </div>}
            </div>
          }

          {currentSection === 4 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='font-semibold tracking-wider'>Projects</h1>
                  <span className='text-sm text-slate-600'>Add your projects</span>
                </div>
                <div className='bg-green-200 text-green-500 flex gap-2 items-center p-2 rounded-md h-[60%] cursor-pointer' onClick={() => addProject()}>
                  <Plus size={20} />
                  <span className='text-md'>Add Project</span>
                </div>
              </div>
              {resumeData.project?.length !== 0 ? <div>
                {resumeData.project?.map((project, index) => (
                  <form action="" className='flex flex-col gap-3 w-full'>
                    <div className='flex justify-between'>
                      <label className='text-xl tracking-wide'>Project #{index + 1}</label>
                      <Trash size={20} className='text-red-500 cursor-pointer' onClick={() => removeEntity("project", index)} />
                    </div>
                    <div className='w-full flex flex-col gap-3'>
                      <div className='w-full flex justify-between'>
                        <input type="text" placeholder='Project Name' value={project.name || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedProject = [...(prev.project || [])];
                          updatedProject[index] = { ...updatedProject[index], name: e.target.value };
                          return { ...prev, project: updatedProject };
                        })} />
                        <input type="text" placeholder='Project Type' value={project.type || ''} className='border-2 text-slate-500 w-80 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                          const updatedProject = [...(prev.project || [])];
                          updatedProject[index] = { ...updatedProject[index], type: e.target.value };
                          return { ...prev, project: updatedProject };
                        })} />
                      </div>
                      <textarea name="" placeholder='Describe your Project...' id="" value={project.description || ''} className='resize-none border-2 text-slate-500 min-h-40 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setResumeData((prev) => {
                        const updatedProject = [...(prev.project || [])];
                        updatedProject[index] = { ...updatedProject[index], description: e.target.value };
                        return { ...prev, project: updatedProject };
                      })}></textarea>
                    </div>

                  </form>
                ))}
              </div> : <div className='flex items-center justify-center flex-col gap-3 p-3'>
                <Folder className='text-slate-400' size={35} />
                <div className='flex flex-col gap-1'>
                  <span className='text-slate-600'>No projects added yet.</span>
                  <span className='text-slate-600 text-sm'>Click "Add Project" to get started.</span>
                </div>
              </div>}
            </div>
          }

          {currentSection === 5 &&
            <div className='px-5 w-full mt-5 flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='font-semibold tracking-wider'>Skills</h1>
                  <span className='text-sm text-slate-600'>Add your technical and soft skills</span>
                </div>
              </div>
              <div className='flex gap-2'>
                <input type="text" placeholder='Enter a skill (e.g. Javascript,NodeJS)' value={skill} className='border-2 text-slate-500 w-150 focus:border-green-300 outline-none border-slate-300 p-2 rounded-md' onChange={(e) => setSkill(e.target.value)} />
                <button className='items-center flex border-1 hover:bg-indigo-200 transition-all duration-500 text-indigo-600 bg-indigo-100 w-max p-2 rounded-md' onClick={handleAddSkills}>
                  <Plus size={20} />
                  Add
                </button>

              </div>
              {resumeData.skills?.length !== 0 ? <div className='flex flex-wrap w-full gap-3'>
                {resumeData.skills.map((skill, index) => (
                  <div className='bg-indigo-200 w-30 text-indigo-500 flex justify-between items-center p-3 rounded-md' key={index}>
                    <span>{skill}</span>
                    <X size={20} onClick={() => { handleRemoveSkill(skill) }} className='cursor-pointer' />
                  </div>
                ))}
              </div> : <div className='flex items-center justify-center flex-col gap-3 p-3'>
                <StarIcon className='text-slate-400' size={35} />
                <div className='flex flex-col items-center gap-1'>
                  <span className='text-slate-600'>No Skills added yet.</span>
                  <span className='text-slate-600 text-sm'>Add your technical and soft skills above.</span>
                </div>
              </div>
              }
              <span className='text-center w-full rounded-md p-4 bg-indigo-100 text-indigo-600 text-sm'>
                <span className='font-semibold tracking-wide'>Tip: </span>List your most relevant skills, separating them clearly, and prioritize those that match the job.
              </span>
            </div>
          }
          <button className='border-green-600 border-1 ml-4 mb-3 hover:bg-green-200 transition-all duration-500 text-green-600 bg-green-100 w-max p-2 rounded-md' onClick={() => { toast.promise(saveResume, { loading: 'Saving...' }) }}>Save Changes</button>

        </div>
        <div id="right" className='shadow-sm w-1/2'>
          <div className='relative w-full'>
            <div className='w-full flex gap-2 justify-end absolute bottom-1'>
              {resumeData.public === true && <button className='border-green-100 hover:bg-green-200 text-green-600 transition-all duration-500 bg-green-100 p-2 rounded-md flex gap-2 items-center' onClick={() => shareResume()}>
                <Share2Icon size={20} />
                <span className=''>Share</span>
              </button>}

              <button className='border-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-all duration-500 bg-indigo-100 p-2 rounded-md flex gap-2 items-center' onClick={() => { toggleVisibility() }}>
                {resumeData.public === true ? (<><Eye size={20} />
                  <span className=''>Public</span></>) : (<><EyeOffIcon size={20} />
                    <span className=''>Private</span></>)}

              </button>
              <button className='border-purple-100 hover:bg-purple-200 text-purple-600 transition-all duration-500 bg-purple-100 p-2 rounded-md flex gap-2 items-center' onClick={() => { downloadResume() }}>
                <DownloadIcon size={20} />
                <span className=''>Download</span>
              </button>
            </div>
          </div>
          <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder