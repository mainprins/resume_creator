import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import { useDispatch } from 'react-redux'
import api from './configs/api'
import { login, setLoading } from './redux/auth/authSlice'
import { useEffect } from 'react'
import {Toaster} from "react-hot-toast"

const App = () => {
  const dispatch = useDispatch();

  const getUserData = async () => {
      const token = localStorage.getItem('token');
      try {
        if(token){
          const {data} = await api.get('/api/auth/user',{headers:{Authorization: token}})
          if(data.user){
            dispatch(login({token,user: data.user}))
          }
          dispatch(setLoading(false))
        } else {
          dispatch(setLoading(false))
        }
      } catch (error) {
        dispatch(setLoading(false))
        console.log(error.message);
        
      }
   
  }

  useEffect(()=>{
    getUserData()
  },[])
  return (
    <>
     <Toaster />
     <Routes>
       <Route path='/' element={<Home/>}/>

       <Route path='app' element={<Layout/>}>
         <Route index element={<Dashboard/>}/>
         <Route path='builder/:resumeId' element={<ResumeBuilder/>}/>
       </Route>

       <Route path='view/:resumeId' element={<Preview/>}/>
       <Route path='login' element={<Login/>}/>
     </Routes>
    </>
  )
}

export default App