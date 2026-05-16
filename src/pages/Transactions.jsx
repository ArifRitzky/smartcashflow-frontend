import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { transactionAPI, walletAPI } from '../services/api'

export default function Transactions() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))

  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('SEMUA')
  const [form, setForm] = useState({
    walletId: '',
    nominal: '',
    tipe: 'EXPENSE',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [t, w] = await Promise.all([
        transactionAPI.getByUser(user.userId),
        walletAPI.getByUser(user.userId),
      ])
      setTransactions(t.data)
      setWallets(w.data)
      if (w.data.length > 0) setForm(f => ({ ...f, walletId: w.data[0].walletId }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.nominal || !form.walletId) return
    setSaving(true)
    try {
      await transactionAPI.create({
        user: { userId: user.userId },
        wallet: { walletId: form.walletId },
        nominal: parseFloat(form.nominal),
        tipe: form.tipe,
        tanggal: form.tanggal,
        keterangan: form.keterangan,
        ocrStatus: 'NONE'
      })
      setShowForm(false)
      setForm({ walletId: wallets[0]?.walletId || '', nominal: '', tipe: 'EXPENSE', tanggal: new Date().toISOString().split('T')[0], keterangan: '' })
      fetchAll()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const filtered = filter === 'SEMUA' ? transactions : transactions.filter(t => t.tipe === filter)

  const totalIncome = transactions.filter(t => t.tipe === 'INCOME').reduce((s, t) => s + t.nominal, 0)
  const totalExpense = transactions.filter(t => t.tipe === 'EXPENSE').reduce((s, t) => s + t.nominal, 0)

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-400">Memuat...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar />

      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Transaksi</h1>
            <p className="text-sm text-gray-400">{transactions.length} transaksi tercatat</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            + Tambah Transaksi
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Semua Transaksi</p>
            <p className="text-xl font-semibold text-gray-800">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Pemasukan</p>
            <p className="text-xl font-semibold text-emerald-600">{formatRp(totalIncome)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Pengeluaran</p>
            <p className="text-xl font-semibold text-red-500">{formatRp(totalExpense)}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {['SEMUA', 'INCOME', 'EXPENSE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition
                ${filter === f ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}>
              {f === 'SEMUA' ? '📋 Semua' : f === 'INCOME' ? '📈 Pemasukan' : '📉 Pengeluaran'}
            </button>
          ))}
        </div>

        {/* Tabel Transaksi */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Keterangan</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Tanggal</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Tipe</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.transactionId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700">{t.keterangan || 'Tanpa keterangan'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{t.tanggal}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg
                        ${t.tipe === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {t.tipe === 'INCOME' ? '📈 Pemasukan' : '📉 Pengeluaran'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-right
                      ${t.tipe === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.tipe === 'INCOME' ? '+' : '-'}{formatRp(t.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">Belum ada transaksi</p>
              <button onClick={() => setShowForm(true)}
                className="mt-3 text-emerald-500 text-sm hover:underline">
                + Tambah transaksi pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Transaksi</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-4">

              {/* Tipe */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipe</label>
                <div className="flex gap-2">
                  {['INCOME', 'EXPENSE'].map(t => (
                    <button key={t} onClick={() => setForm({...form, tipe: t})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                        ${form.tipe === t
                          ? t === 'INCOME' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-500'}`}>
                      {t === 'INCOME' ? '📈 Pemasukan' : '📉 Pengeluaran'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nominal</label>
                <input type="number" placeholder="500000" value={form.nominal}
                  onChange={e => setForm({...form, nominal: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>

              {/* Dompet */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Dompet</label>
                <select value={form.walletId} onChange={e => setForm({...form, walletId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {wallets.map(w => <option key={w.walletId} value={w.walletId}>{w.namaWallet}</option>)}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tanggal</label>
                <input type="date" value={form.tanggal}
                  onChange={e => setForm({...form, tanggal: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Keterangan</label>
                <input type="text" placeholder="Gaji Mei, Makan siang, dll" value={form.keterangan}
                  onChange={e => setForm({...form, keterangan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}