const Spinner = () => {
  return (
    <div className='flex min-h-[60vh] w-full items-center justify-center p-8' role='status' aria-label='Loading'>
      <span className='h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-emerald-500' />
    </div>
  )
}

export default Spinner
