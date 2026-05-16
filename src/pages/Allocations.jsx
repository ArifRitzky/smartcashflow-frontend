import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationAPI, walletAPI } from '../services/api'

export default function Allocations() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('scf_user'))

  const [rules, setRules] = useState([])
  const [wallets, setWallets] = useState([])
  const [deficits, setDeficits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    namaPos: '',
    tipeAlokasi: 'PERSENTASE',
    persentase: '',
    fixedNominal: '',
    walletId: '',
    urutan: 1,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [r, w, d] = await Promise.all([
        allocationAPI.getRulesByUser(user.userId),
        walletAPI.getByUser(user.userId),
        allocationAPI.getDeficits(user.userId),
      ])
      setRules(r.data)
      setWallets(w.data)
      setDeficits(d.data)
      if (w.data.length > 0) setForm(f => ({ ...f, walletId: w.data[0].walletId }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.namaPos || !form.walletId) {
      setError('Nama pos dan dompet wajib diisi')
      return
    }
    if (form.tipeAlokasi === 'PERSENTASE' && !form.persentase) {
      setError('Persentase wajib diisi')
      return
    }
    if (form.tipeAlokasi === 'FIXED' && !form.fixedNominal) {
      setError('Nominal tetap wajib diisi')
      return
    }
    setSaving(true)
    setError('')
    try {
      await allocationAPI.createRule({
        user: { userId: user.userId },
        namaPos: form.namaPos,
        persentase: form.tipeAlokasi === 'PERSENTASE' ? parseFloat(form.persentase) : null,
        fixedNominal: form.tipeAlokasi === 'FIXED' ? parseFloat(form.fixedNominal) : null,
        wallet: { walletId: form.walletId },
        urutan: parseInt(form.urutan),
        isActive: true,
      })
      setShowForm(false)
      setForm({ namaPos: '', tipeAlokasi: 'PERSENTASE', persentase: '', fixedNominal: '', walletId: wallets[0]?.walletId || '', urutan: rules.length + 1 })
      fetchAll()
    } catch (e) {
      setError(e.response?.data || 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async (deficitId) => {
    try {
      await allocationAPI.resolveDeficit(deficitId)
      fetchAll()
    } catch (e) {
      console.error(e)
    }
  }

  const formatRp = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(n)

  const totalPersentase = rules
    .filter(r => r.persentase !== null)
    .reduce((sum, r) => sum + r.persentase, 0)

  const COLORS = ['#1D9E75', '#378ADD', '#7F77DD', '#EF9F27', '#E8589A', '#E24B4A']

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Memuat...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Mesin Alokasi</h1>
            <p className="text-sm text-gray-400">{rules.length} rule aktif</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            + Tambah Rule
          </button>
        </div>

        {rules.filter(r => r.persentase !== null).length > 0 && (
          <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3
            ${totalPersentase > 100 ? 'bg-red-50 border border-red-200'
              : totalPersentase === 100 ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-amber-50 border border-amber-200'}`}>
            <span className="text-2xl">
              {totalPersentase > 100 ? '⛔' : totalPersentase === 100 ? '✅' : '⚠️'}
            </span>
            <div>
              <p className={`text-sm font-medium
                ${totalPersentase > 100 ? 'text-red-700'
                  : totalPersentase === 100 ? 'text-emerald-700'
                  : 'text-amber-700'}`}>
                Total persentase: {totalPersentase}%
              </p>
              <p className={`text-xs
                ${totalPersentase > 100 ? 'text-red-500'
                  : totalPersentase === 100 ? 'text-emerald-500'
                  : 'text-amber-500'}`}>
                {totalPersentase > 100 ? 'Melebihi 100% — sistem akan menolak alokasi'
                  : totalPersentase === 100 ? 'Sempurna! Semua dana teralokasi'
                  : `Sisa ${100 - totalPersentase}% akan masuk default wallet`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Rule Alokasi</p>
            {rules.length > 0 ? (
              <div className="flex flex-col gap-3">
                {rules.map((rule, i) => (
                  <div key={rule.ruleId} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: COLORS[i % COLORS.length] }}>
                        {rule.urutan}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{rule.namaPos}</p>
                        <p className="text-xs text-gray-400">{rule.wallet?.namaWallet || 'Wallet tidak diketahui'}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg
                        ${rule.fixedNominal !== null ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {rule.fixedNominal !== null ? formatRp(rule.fixedNominal) : `${rule.persentase}%`}
                      </span>
                    </div>
                    {rule.persentase !== null && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.min(rule.persentase, 100)}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-gray-500 text-sm font-medium mb-1">Belum ada rule</p>
                <p className="text-gray-400 text-xs mb-4">Buat rule untuk mengatur alokasi dana otomatis</p>
                <button onClick={() => setShowForm(true)} className="text-emerald-500 text-sm hover:underline">
                  + Buat rule pertama
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Log Defisit
              {deficits.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                  {deficits.length} belum selesai
                </span>
              )}
            </p>
            {deficits.length > 0 ? (
              <div className="flex flex-col gap-3">
                {deficits.map(d => (
                  <div key={d.deficitId} className="bg-white rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{d.rule?.namaPos || 'Rule tidak diketahui'}</p>
                        <p className="text-xs text-gray-400">Kekurangan dana alokasi</p>
                      </div>
                      <button onClick={() => handleResolve(d.deficitId)}
                        className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded-lg transition">
                        Selesai ✓
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Dibutuhkan</p>
                        <p className="text-xs font-medium text-gray-700">{formatRp(d.nominalDibutuhkan)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Tersedia</p>
                        <p className="text-xs font-medium text-gray-700">{formatRp(d.saldoTersedia)}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="text-xs text-red-400">Selisih</p>
                        <p className="text-xs font-medium text-red-600">-{formatRp(d.selisih)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-500 text-sm font-medium">Tidak ada defisit</p>
                <p className="text-gray-400 text-xs mt-1">Semua alokasi berjalan normal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Rule Alokasi</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Pos</label>
                <input type="text" placeholder="Kost, Tabungan, Jajan, dll"
                  value={form.namaPos} onChange={e => setForm({...form, namaPos: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tipe Alokasi</label>
                <div className="flex gap-2">
                  {[{ value: 'PERSENTASE', label: '% Persentase' }, { value: 'FIXED', label: '🔒 Nominal Tetap' }].map(t => (
                    <button key={t.value} onClick={() => setForm({...form, tipeAlokasi: t.value})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition
                        ${form.tipeAlokasi === t.value ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {form.tipeAlokasi === 'PERSENTASE' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Persentase (%)</label>
                  <input type="number" placeholder="20" min="1" max="100"
                    value={form.persentase} onChange={e => setForm({...form, persentase: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nominal Tetap (Rp)</label>
                  <input type="number" placeholder="800000"
                    value={form.fixedNominal} onChange={e => setForm({...form, fixedNominal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Dompet Tujuan</label>
                <select value={form.walletId} onChange={e => setForm({...form, walletId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  {wallets.map(w => <option key={w.walletId} value={w.walletId}>{w.namaWallet}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Urutan Prioritas <span className="text-gray-400 font-normal ml-1">(1 = paling utama)</span>
                </label>
                <input type="number" min="1" value={form.urutan}
                  onChange={e => setForm({...form, urutan: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}