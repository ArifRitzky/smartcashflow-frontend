import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', nama: '', googleId: '' })
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!form.email || !form.nama) {
      setError('Email dan nama wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Coba cari user by email dulu
      let user
      try {
        const res = await userAPI.getByEmail(form.email)
        user = res.data
      } catch {
        // Kalau tidak ada, buat user baru
        const res = await userAPI.create({
          email: form.email,
          nama: form.nama,
          googleId: form.googleId || `google_${Date.now()}`,
          phoneNumber: ''
        })
        user = res.data
      }
      localStorage.setItem('scf_user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Panel kiri */}
      <div className="hidden lg:flex flex-1 bg-emerald-500 flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
          <span className="text-4xl">💰</span>
        </div>
        <h1 className="text-3xl font-semibold mb-3">SmartCashFlow AI</h1>
        <p className="text-emerald-100 text-center max-w-xs leading-relaxed">
          Kelola arus kasmu dengan cerdas — otomatis, presisi, dan terstruktur.
        </p>
        <div className="mt-10 flex flex-col gap-4 w-full max-w-xs">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="text-xl">📷</span>
            <span className="text-sm">Scan struk otomatis via OCR</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="text-xl">📊</span>
            <span className="text-sm">Alokasi dana otomatis berjenjang</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <span className="text-xl">💬</span>
            <span className="text-sm">Notifikasi WhatsApp real-time</span>
          </div>
        </div>
      </div>

      {/* Panel kanan */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-6">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Masuk ke akun</h2>
          <p className="text-gray-500 text-sm mb-8">Masukkan detail akun kamu untuk mulai</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nama lengkap</label>
              <input
                type="text"
                placeholder="Masukkan Nama"
                value={form.nama}
                onChange={e => setForm({...form, nama: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="Masukkan Email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk →'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Data kamu aman dan terisolasi dari pengguna lain
          </p> 
        </div>
      </div>
    </div>
  )
}