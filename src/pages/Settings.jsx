import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const ACCENT_COLORS = [
  { name: 'Hijau', value: '#1D9E75' },
  { name: 'Biru', value: '#378ADD' },
  { name: 'Ungu', value: '#7F77DD' },
  { name: 'Merah', value: '#E24B4A' },
  { name: 'Oranye', value: '#EF9F27' },
  { name: 'Pink', value: '#E8589A' },
]

const GRADIENTS = [
  { name: 'Hijau ke Biru', value: 'linear-gradient(135deg, #1D9E75, #378ADD)' },
  { name: 'Ungu ke Pink', value: 'linear-gradient(135deg, #7F77DD, #E8589A)' },
  { name: 'Oranye ke Merah', value: 'linear-gradient(135deg, #EF9F27, #E24B4A)' },
  { name: 'Gelap', value: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
]

export default function Settings() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))

  const savedPrefs = JSON.parse(localStorage.getItem('scf_prefs')) || {}

  const [themeColor, setThemeColor] = useState(savedPrefs.themeColor || '#1D9E75')
  const [bgType, setBgType] = useState(savedPrefs.bgType || 'DEFAULT')
  const [bgValue, setBgValue] = useState(savedPrefs.bgValue || '')
  const [darkMode, setDarkMode] = useState(savedPrefs.darkMode || false)
  const [customBgPreview, setCustomBgPreview] = useState(savedPrefs.bgValue || '')
  const [saved, setSaved] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCustomBgPreview(ev.target.result)
      setBgValue(ev.target.result)
      setBgType('CUSTOM_IMAGE')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const prefs = { themeColor, bgType, bgValue, darkMode }
    localStorage.setItem('scf_prefs', JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const getSidebarStyle = () => {
    if (bgType === 'COLOR') return { background: bgValue }
    if (bgType === 'GRADIENT') return { background: bgValue }
    if (bgType === 'CUSTOM_IMAGE') return {
      backgroundImage: `url(${bgValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
    return {}
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Pengaturan</h1>
          <p className="text-sm text-gray-400">Kustomisasi tampilan dashboardmu</p>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Panel Kiri: Pengaturan */}
          <div className="flex flex-col gap-4">

            {/* Warna Aksen */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Warna Aksen</p>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(c => (
                  <button key={c.value} onClick={() => setThemeColor(c.value)}
                    title={c.name}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c.value,
                      border: themeColor === c.value ? `3px solid #1a1a1a` : '3px solid transparent',
                      transform: themeColor === c.value ? 'scale(1.15)' : 'scale(1)'
                    }} />
                ))}
              </div>
            </div>

            {/* Background Sidebar */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Background Sidebar</p>

              {/* Pilihan Tipe */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { value: 'DEFAULT', label: 'Default' },
                  { value: 'COLOR', label: 'Warna' },
                  { value: 'GRADIENT', label: 'Gradient' },
                  { value: 'CUSTOM_IMAGE', label: '🖼 Foto' },
                ].map(t => (
                  <button key={t.value} onClick={() => setBgType(t.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition
                      ${bgType === t.value
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-500'}`}
                    style={bgType === t.value ? { background: themeColor } : {}}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Pilihan Warna Solid */}
              {bgType === 'COLOR' && (
                <div className="flex gap-2 flex-wrap">
                  {['#1a1a2e', '#0f3460', '#533483', '#2C3E50', '#1D9E75', '#E8589A'].map(c => (
                    <button key={c} onClick={() => setBgValue(c)}
                      className="w-8 h-8 rounded-full border-2 transition"
                      style={{
                        background: c,
                        borderColor: bgValue === c ? '#1a1a1a' : 'transparent'
                      }} />
                  ))}
                  <input type="color" value={bgValue || '#1a1a2e'}
                    onChange={e => setBgValue(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer border-0"
                    title="Pilih warna custom" />
                </div>
              )}

              {/* Pilihan Gradient */}
              {bgType === 'GRADIENT' && (
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map(g => (
                    <button key={g.value} onClick={() => setBgValue(g.value)}
                      title={g.name}
                      className="w-10 h-10 rounded-xl border-2 transition"
                      style={{
                        background: g.value,
                        borderColor: bgValue === g.value ? '#1a1a1a' : 'transparent'
                      }} />
                  ))}
                </div>
              )}

              {/* Upload Foto */}
              {bgType === 'CUSTOM_IMAGE' && (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-400 transition">
                    <span className="text-2xl mb-1">🖼</span>
                    <span className="text-xs text-gray-400">Klik untuk upload foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {customBgPreview && (
                    <div className="mt-2 w-full h-16 rounded-xl overflow-hidden">
                      <img src={customBgPreview} alt="preview"
                        className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tampilan Lainnya */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Tampilan</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Mode Gelap</p>
                  <p className="text-xs text-gray-400">Segera hadir</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  onClick={() => setDarkMode(!darkMode)}
                  style={darkMode ? { background: themeColor } : {}}
                  role="button">
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform shadow
                    ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <button onClick={handleSave}
              className="w-full py-3 rounded-xl text-white text-sm font-medium transition"
              style={{ background: themeColor }}>
              {saved ? '✅ Tersimpan!' : 'Simpan Perubahan'}
            </button>
          </div>

          {/* Panel Kanan: Preview */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

              {/* Mini Dashboard */}
              <div className="flex h-80">

                {/* Mini Sidebar */}
                <div className="w-32 flex flex-col p-3 gap-1"
                  style={bgType === 'DEFAULT'
                    ? { background: 'white', borderRight: '1px solid #f3f4f6' }
                    : { ...getSidebarStyle(), borderRight: '1px solid rgba(255,255,255,0.1)' }}>

                  <div className="flex items-center gap-2 pb-2 mb-1"
                    style={{ borderBottom: '1px solid rgba(128,128,128,0.2)' }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ background: themeColor }}>💰</div>
                    <span className="text-xs font-semibold"
                      style={{ color: bgType === 'DEFAULT' ? '#1f2937' : 'white' }}>
                      SCF AI
                    </span>
                  </div>

                  {[
                    { icon: '📊', label: 'Dashboard', active: true },
                    { icon: '💸', label: 'Transaksi', active: false },
                    { icon: '👛', label: 'Dompet', active: false },
                    { icon: '📋', label: 'Alokasi', active: false },
                  ].map(item => (
                    <div key={item.label}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: item.active
                          ? bgType === 'DEFAULT' ? '#f0fdf4' : 'rgba(255,255,255,0.2)'
                          : 'transparent',
                        color: item.active
                          ? bgType === 'DEFAULT' ? themeColor : 'white'
                          : bgType === 'DEFAULT' ? '#6b7280' : 'rgba(255,255,255,0.7)',
                        fontWeight: item.active ? '500' : '400'
                      }}>
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>

                {/* Mini Content */}
                <div className="flex-1 p-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-700 mb-2">Dashboard</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['Total Saldo', 'Pemasukan'].map(label => (
                      <div key={label} className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold"
                          style={{ color: label === 'Pemasukan' ? themeColor : '#1f2937' }}>
                          Rp 800rb
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-1">Alokasi</p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full w-3/5"
                        style={{ background: themeColor }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">
              Preview langsung berubah saat kamu memilih opsi
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}