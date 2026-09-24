import React from 'react'
import {useAuth} from '../../context/AuthContext';
import {User,Menu} from 'lucide-react'
import { Link } from 'react-router-dom';


const Header = ({toggleSidebar}) => {
  const {user} = useAuth();
  return <header className='sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60'>
    <div className='flex items-center justify-between h-full px-6'>
      {/*Mobile menu Button */}
      <button
        onClick={toggleSidebar}
        className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200'
        aria-label="Toggle sidebar"
      >
        <Menu size={24}/>
      </button>
      <div className='hidden md:block'></div>
      <div className='flex items-center gap-3'>
          {/*User Profile */}
          <div className='flex items-center gap-3 pl-3 border-l border-slate-200/60'>
            <Link to='/profile' aria-label='Open profile' className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group'>
              {user?.profileImage ? (
                <img src={user.profileImage} alt='' className='h-9 w-9 rounded-full object-cover shadow-md shadow-emerald-500/20' />
              ) : (
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20'>
                  <User size={18} strokeWidth={2.5}/>
                </div>
              )}
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  {user?.username || 'Account'}
                </p>
                <p className='text-xs text-slate-500'>
                  {user?.email || 'Loading account'}
                </p>
              </div>
            </Link>
          </div>
        </div>
    </div>
  </header>
}

export default Header
