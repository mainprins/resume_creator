import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import {useSelector} from "react-redux"
import Login from './Login.jsx'

const Layout = () => {
  const {user,loading} = useSelector(state => state.auth);

  if(loading){
    return <div>Loading...</div>
  }
  return (
    <div>
      {user ? (<div>
      
      <Navbar />
      <Outlet />
    </div>) : <Login />}
    </div>
    
  )
}

export default Layout