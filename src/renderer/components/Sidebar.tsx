import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/live', label: 'Live Projection', icon: 'cast' },
  { path: '/scripture', label: 'Scripture', icon: 'menu_book' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:flex w-[280px] flex-col border-r border-border-dark bg-background-dark h-full shrink-0">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Brand */}
          <div className="flex gap-3 items-center px-2 py-2 drag-region">
            <div className="bg-primary/20 rounded-lg size-10 flex items-center justify-center text-primary no-drag">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex flex-col no-drag">
              <h1 className="text-white text-base font-bold leading-normal">Sermon Up</h1>
              <p className="text-text-secondary text-xs font-normal leading-normal">
                Projection System
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20 text-white'
                      : 'hover:bg-surface-dark text-text-secondary hover:text-white border border-transparent'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isActive ? 'text-primary' : ''
                    }`}
                    style={{ fontSize: '20px' }}
                  >
                    {item.icon}
                  </span>
                  <p className="text-sm font-medium leading-normal">{item.label}</p>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2">
          <NavLink
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              location.pathname === '/settings'
                ? 'bg-primary/10 border border-primary/20 text-white'
                : 'hover:bg-surface-dark text-text-secondary hover:text-white border border-transparent'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                location.pathname === '/settings' ? 'text-primary' : ''
              }`}
              style={{ fontSize: '20px' }}
            >
              settings
            </span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </NavLink>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-border-dark">
            <div className="bg-primary/20 rounded-full size-8 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                person
              </span>
            </div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-medium leading-none">Operator</p>
              <p className="text-text-secondary text-xs mt-1">Media Team</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
