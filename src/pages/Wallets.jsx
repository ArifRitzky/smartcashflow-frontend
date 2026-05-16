import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletAPI } from '../services/api'

export default function Wallets() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))

  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    namaWallet: '',
    saldo: '',
    currency: 'IDR',
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchWallets()
  }, [])

  const fetchWallets = async () => {
    try {
      const res = await walletAPI.getByUser(user.userId)
      setWallets(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.namaWallet) return
    setSaving(true)
    try {
      await walletAPI.create({
        user: { userId: user.userId },
        namaWallet: form.namaWallet,
        saldo: parseFloat(form.saldo) || 0,
        currency: form.currency,
        isActive: true,
      })
      setShowForm(false)
      setForm({ namaWallet: '', saldo: '', currency: 'IDR' })
      fetchWallets()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (walletId) => {
    if (!confirm('Nonaktifkan dompet ini?')) return
    try {
      await walletAPI.deactivate(walletId)
      fetchWallets()
    } catch (e) {
      console.error(e)
    }
  }

  const formatRp = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(n)

  const totalSaldo = wallets.reduce((sum, w) => sum + (w.saldo || 0), 0)

  const COLORS = ['#1D9E75', '#378ADD', '#7F77DD', '#EF9F27', '#E8589A', '#E24B4A']

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Memuat...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar />
        <div className="mt-auto border-t border-gray-100 pt-3">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-800">{user?.nama}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button onClick={() => { localStorage.removeItem('scf_user'); navigate('/login') }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
            🚪 Keluar
          </button>
        </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Dompet</h1>
            <p className="text-sm text-gray-400">{wallets.length} dompet aktif</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            + Tambah Dompet
          </button>
        </div>

        {/* Total Saldo */}
        <div className="bg-emerald-500 rounded-2xl p-5 mb-6 text-white">
          <p className="text-emerald-100 text-sm mb-1">Total Saldo Semua Dompet</p>
          <p className="text-3xl font-semibold">{formatRp(totalSaldo)}</p>
          <p className="text-emerald-100 text-xs mt-2">{wallets.length} dompet aktif</p>
        </div>

        {/* Grid Dompet */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {wallets.map((w, i) => (
              <div key={w.walletId}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-semibold"
                      style={{ background: COLORS[i % COLORS.length] }}>
                      {w.namaWallet.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{w.namaWallet}</p>
                      <p className="text-xs text-gray-400">{w.currency}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeactivate(w.walletId)}
                    className="text-xs text-gray-300 hover:text-red-400 transition">
                    ✕
                  </button>
                </div>
                <p className="text-2xl font-semibold text-gray-800">{formatRp(w.saldo || 0)}</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      background: COLORS[i % COLORS.length],
                      width: totalSaldo > 0 ? `${((w.saldo || 0) / totalSaldo) * 100}%` : '0%'
                    }}>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {totalSaldo > 0 ? `${(((w.saldo || 0) / totalSaldo) * 100).toFixed(1)}% dari total` : '0% dari total'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <p className="text-4xl mb-3">👛</p>
            <p className="text-gray-500 font-medium mb-1">Belum ada dompet</p>
            <p className="text-gray-400 text-sm mb-4">Tambahkan dompet pertamamu untuk mulai mencatat</p>
            <button onClick={() => setShowForm(true)}
              className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition">
              + Tambah Dompet
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Dompet</h2>
              <button onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Nama Dompet */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Dompet</label>
                <input type="text" placeholder="Bank Jago, GoPay, Tunai, dll"
                  value={form.namaWallet}
                  onChange={e => setForm({...form, namaWallet: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>

              {/* Saldo Awal */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Saldo Awal <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input type="number" placeholder="0"
                  value={form.saldo}
                  onChange={e => setForm({...form, saldo: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>

              {/* Currency */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mata Uang</label>
                <select value={form.currency}
                  onChange={e => setForm({...form, currency: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="IDR">IDR — Rupiah</option>
                  <option value="USD">USD — Dollar</option>
                  <option value="SGD">SGD — Dollar Singapura</option>
                </select>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Dompet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}