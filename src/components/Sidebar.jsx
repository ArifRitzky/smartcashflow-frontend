import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const menuItems = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { label: 'Transaksi', icon: '💸', path: '/transactions' },
  { label: 'Dompet', icon: '👛', path: '/wallets' },
  { label: 'Alokasi', icon: '📋', path: '/allocations' },
  { label: 'Pengaturan', icon: '⚙️', path: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))
  const location = useLocation()
    const currentPath = location.pathname
  const [prefs, setPrefs] = useState(() => {
    return JSON.parse(localStorage.getItem('scf_prefs')) || {
      themeColor: '#1D9E75',
      bgType: 'DEFAULT',
      bgValue: '',
      darkMode: false,
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('scf_user')
    navigate('/login')
  }

  const getSidebarStyle = () => {
    if (prefs.bgType === 'COLOR') return { background: prefs.bgValue }
    if (prefs.bgType === 'GRADIENT') return { background: prefs.bgValue }
    if (prefs.bgType === 'CUSTOM_IMAGE') return {
      backgroundImage: `url(${prefs.bgValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
    return {}
  }

  const isCustomBg = prefs.bgType !== 'DEFAULT'
  const textColor = isCustomBg ? 'white' : '#6b7280'
  const activeTextColor = isCustomBg ? 'white' : prefs.themeColor
  const activeBg = isCustomBg ? 'rgba(255,255,255,0.2)' : ''
  const borderColor = isCustomBg ? 'rgba(255,255,255,0.15)' : '#f3f4f6'

  return (
    <div
      className="w-52 flex flex-col p-4 gap-1 min-h-screen"
      style={{
        background: isCustomBg ? undefined : 'white',
        borderRight: `1px solid ${borderColor}`,
        ...getSidebarStyle()
      }}>

      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2"
        style={{ borderBottom: `1px solid ${borderColor}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
          style={{ background: prefs.themeColor }}>
          💰
        </div>
        <span className="font-semibold text-sm"
          style={{ color: isCustomBg ? 'white' : '#1f2937' }}>
          SmartCashFlow
        </span>
      </div>

      {/* Menu */}
      {menuItems.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition"
          style={{
            background: currentPath === item.path ? activeBg || `${prefs.themeColor}15` : 'transparent',
            color: currentPath === item.path ? activeTextColor : textColor,
            fontWeight: currentPath === item.path ? '500' : '400',
          }}>
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* User Info */}
      <div className="mt-auto pt-3"
        style={{ borderTop: `1px solid ${borderColor}` }}>
        <div className="px-3 py-2">
          <p className="text-sm font-medium"
            style={{ color: isCustomBg ? 'white' : '#1f2937' }}>
            {user?.nama}
          </p>
          <p className="text-xs truncate"
            style={{ color: isCustomBg ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
            {user?.email}
          </p>
        </div>
        <button onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm rounded-xl transition"
          style={{ color: isCustomBg ? 'rgba(255,255,255,0.7)' : '#ef4444' }}>
          🚪 Keluar
        </button>
      </div>
    </div>
  )
}