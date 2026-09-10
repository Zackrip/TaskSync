import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className='flex h-screen bg-gray-100'>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <div className='flex-1 flex flex-col min-h-0'>
            <Navbar onToggleSidebar={toggleSidebar} />
            <main className='flex-1 overflow-y-auto min-h-0'>
                <Outlet />
            </main>

        </div>

    </div>
  )
}

export default DashboardLayout