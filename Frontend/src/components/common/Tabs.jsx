import React from 'react'

const Tabs = ({tabs,activeTab,setActiveTab}) => {
  return (
    <div className='w-full'>
      <div className='relative border-b border-slate-200/70'>
        <nav className='flex gap-1 overflow-x-auto'>
          {tabs.map((tab)=>(
            <button
              key={tab.name}
              onClick={()=>setActiveTab(tab.name)}
              className={`relative whitespace-nowrap pb-4 px-3 md:px-5 text-sm font-semibold transition-all duration-200 ${
                activeTab===tab.name ? 'text-emerald-600': 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className='relative z-10'>{tab.label}</span>
              {activeTab===tab.name && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/25'/>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className='py-6'>
        {tabs.map((tab)=>{
        if(tab.name === activeTab){
          return(
            <div
              key={tab.name}
              className='animate-in fade-in duration-300'
            >
              {tab.content}
            </div>
          );
        }
        return null;
        })}
      </div>
    </div>
  )
};

export default Tabs
