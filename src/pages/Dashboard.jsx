import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletAPI, transactionAPI, allocationAPI } from '../services/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))

  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [deficits, setDeficits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [w, t, d] = await Promise.all([
        walletAPI.getByUser(user.userId),
        transactionAPI.getByUser(user.userId),
        allocationAPI.getDeficits(user.userId),
      ])
      setWallets(w.data)
      setTransactions(t.data)
      setDeficits(d.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalSaldo = wallets.reduce((sum, w) => sum + (w.saldo || 0), 0)
  const totalIncome = transactions.filter(t => t.tipe === 'INCOME').reduce((sum, t) => sum + t.nominal, 0)
  const totalExpense = transactions.filter(t => t.tipe === 'EXPENSE').reduce((sum, t) => sum + t.nominal, 0)

  const formatRp = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(n)

  const chartData = transactions
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
    .reduce((acc, t) => {
      const tgl = t.tanggal
      const existing = acc.find(d => d.tgl === tgl)
      if (existing) {
        if (t.tipe === 'INCOME') existing.pemasukan += t.nominal
        else existing.pengeluaran += t.nominal
      } else {
        acc.push({
          tgl,
          pemasukan: t.tipe === 'INCOME' ? t.nominal : 0,
          pengeluaran: t.tipe === 'EXPENSE' ? t.nominal : 0,
        })
      }
      return acc
    }, [])

  const pieData = wallets.map(w => ({ name: w.namaWallet, value: w.saldo || 0 }))
  const COLORS = ['#1D9E75', '#378ADD', '#7F77DD', '#EF9F27', '#E8589A', '#E24B4A']

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Memuat data...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400">Selamat datang, {user?.nama} 👋</p>
          </div>
          {deficits.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-xl">
              ⚠️ {deficits.length} defisit alokasi belum diselesaikan
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Saldo</p>
            <p className="text-xl font-semibold text-gray-800">{formatRp(totalSaldo)}</p>
            <p className="text-xs text-gray-400 mt-1">{wallets.length} dompet aktif</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Pemasukan</p>
            <p className="text-xl font-semibold text-emerald-600">{formatRp(totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-1">{transactions.filter(t => t.tipe === 'INCOME').length} transaksi</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total Pengeluaran</p>
            <p className="text-xl font-semibold text-red-500">{formatRp(totalExpense)}</p>
            <p className="text-xs text-gray-400 mt-1">{transactions.filter(t => t.tipe === 'EXPENSE').length} transaksi</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">Cash Flow</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="tgl" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}rb`} />
                  <Tooltip formatter={v => formatRp(v)} />
                  <Line type="monotone" dataKey="pemasukan" stroke="#1D9E75" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pengeluaran" stroke="#E24B4A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Belum ada data transaksi
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-4">Distribusi Saldo Dompet</p>
            {pieData.filter(p => p.value > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatRp(v)} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Belum ada data dompet
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Saldo Dompet</p>
            {wallets.length > 0 ? wallets.map((w, i) => (
              <div key={w.walletId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm text-gray-700">{w.namaWallet}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{formatRp(w.saldo || 0)}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada dompet</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Transaksi Terbaru</p>
            {transactions.length > 0 ? transactions.slice(0, 5).map(t => (
              <div key={t.transactionId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-700">{t.keterangan || 'Tanpa keterangan'}</p>
                  <p className="text-xs text-gray-400">{t.tanggal}</p>
                </div>
                <span className={`text-sm font-medium ${t.tipe === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.tipe === 'INCOME' ? '+' : '-'}{formatRp(t.nominal)}
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-400 py-4 text-center">Belum ada transaksi</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}