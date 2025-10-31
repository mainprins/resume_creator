import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../redux/auth/authSlice';

const Navbar = () => {
  const {user} = useSelector(state=>state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutUser = ()=>{
         navigate('/')
         dispatch(logout())
  }
  return (
    <div className='px-4 md:px-8 xl:px-12 2xl:px-16 flex justify-between items-center py-3 shadow-sm'>
      <Link to={'/'}><span className='text-2xl font-semibold tracking-wider'>Meroresume<span className='text-green-600'>.</span></span></Link>
      <div className='flex gap-4 items-center'>
         <span>Hi,{user?.name}</span>
         <button className='bg-whiter border-slate-800 border-2 rounded-full px-3 hover:bg-slate-400 hover:text-white' onClick={()=>logoutUser()}>Logout</button>
      </div>
    </div>
  )
}

export default Navbar