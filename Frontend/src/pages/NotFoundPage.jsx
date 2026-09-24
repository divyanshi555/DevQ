import { ArrowLeft, Compass, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-12 text-slate-900'>
      <div className='absolute inset-0 bg-[radial-gradient(#dbe4e8_1px,transparent_1px)] bg-size-[18px_18px] opacity-60' />
      <div className='relative w-full max-w-2xl text-center'>

        
        <h1 className='mt-4 text-7xl font-semibold tracking-tight text-slate-900 sm:text-8xl'>404</h1>
        <h2 className='mt-4 text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl'>Page not found</h2>
        <p className='mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base'>
          The page you are looking for does not exist or may have moved somewhere else.
        </p>

        <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Link to='/' className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-300/30'>
            <Home size={16} />
            Go to home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage
