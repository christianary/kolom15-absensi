import { useState, useEffect, useCallback, useRef } from 'react'
import styles from '../styles/Home.module.css'

const MEMBERS = [
  "Ferry Walangitan","Naomi Onsu","Jeremy Walangitan","Jesaya Walangitan","Rio Seroy",
  "Linda Sahir","Syalom Seroy","Niko Pontoh","Marlen Pandeiroth","Samy Poli",
  "Deby Pontoh","Tifanny Poli","Felicia Poli","Rifaldy Kamasi","Deshila Sulaiman",
  "Piter Sumael","Meiske Rompis","Dandy Sumael","Olga Moniaga","Erica Mokoagow",
  "Jein Mumu","Teddy Sajow","Fanly Horman","Prifilia Patuwo","Yakob Patuwo",
  "Anita Powa","Andre Patuwo","Yence Tehamen","Lidya Linda","Mirekel Tehamen",
  "Eklesio Tehamen","Corneles Linda","Ledy Linda","Jorce Lonteng","Dian Lonteng",
  "Marthen","Meyke Rurut","Putri Pratiwi","Githa Cahyani","Troy Manopo",
  "Kartia Daenglino","Marcelino Manopo","Altris Dunggurio","Marieke Rompas","Melany Dunggurio",
  "Victor Dunggurio","Elizabeth Dunggurio","Marnix Masinambou","Anita Carlos","Edwin Tatuil",
  "Meiske Repi","Billy Rambing","Anggreiny Tatuil","Georgia Rambing","Vivi Rawung",
  "Jesika Jakob","Daniel Tinus","Vina Jacob","Meita Rawung","Alviani Atilida"
]

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const START = new Date('2026-01-20')
const END   = new Date('2026-11-24')

function getAllTuesdays() {
  const weeks = []
  let d = new Date(START)
  while (d <= END) { weeks.push(new Date(d)); d.setDate(d.getDate() + 7) }
  return weeks
}

function weekKey(d) {
  return `w_${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,'0')}_${String(d.getDate()).padStart(2,'0')}`
}

function fmtDate(d) {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function fmtShort(d) {
  return `${d.getDate()}/${d.getMonth()+1}`
}

const ALL_WEEKS = getAllTuesdays()

function getClosestWeekIdx() {
  const now = new Date()
  let best = 0, bestDiff = Infinity
  ALL_WEEKS.forEach((w, i) => {
    const diff = Math.abs(w - now)
    if (diff < bestDiff) { bestDiff = diff; best = i }
  })
  return best
}

export default function Home() {
  const [page, setPage]             = useState('absensi')
  const [weekIdx, setWeekIdx]       = useState(getClosestWeekIdx())
  const [attendance, setAttendance] = useState({})
  const [search, setSearch]         = useState('')
  const [syncStatus, setSyncStatus] = useState('idle') // idle | saving | saved | error
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const saveTimer = useRef(null)

  // Load on mount
  useEffect(() => {
    fetch('/api/attendance')
      .then(r => r.json())
      .then(({ data }) => {
        setAttendance(data || {})
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        showToast('Gagal memuat data. Cek koneksi internet.')
      })
  }, [])

  // Set default month selector
  useEffect(() => {
    const now = new Date()
    const key = `${now.getFullYear()}-${now.getMonth()}`
    const available = getAvailableMonths()
    if (available.find(m => m.key === key)) setSelectedMonth(key)
    else if (available.length) setSelectedMonth(available[0].key)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const saveToServer = useCallback((data) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSyncStatus('saving')
    saveTimer.current = setTimeout(() => {
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })
        .then(r => r.json())
        .then(res => {
          if (res.success) setSyncStatus('saved')
          else setSyncStatus('error')
        })
        .catch(() => setSyncStatus('error'))
    }, 800)
  }, [])

  const toggleMember = (name) => {
    const w = ALL_WEEKS[weekIdx]
    const key = weekKey(w)
    setAttendance(prev => {
      const weekData = prev[key] || {}
      const cur = weekData[name] || 'unmarked'
      const next = cur === 'unmarked' ? 'hadir' : cur === 'hadir' ? 'absent' : 'hadir'
      const updated = { ...prev, [key]: { ...weekData, [name]: next } }
      saveToServer(updated)
      return updated
    })
  }

  const markAll = (status) => {
    const w = ALL_WEEKS[weekIdx]
    const key = weekKey(w)
    setAttendance(prev => {
      const weekData = {}
      MEMBERS.forEach(m => weekData[m] = status)
      const updated = { ...prev, [key]: weekData }
      saveToServer(updated)
      return updated
    })
    showToast(status === 'hadir' ? 'Semua jemaat ditandai Hadir ✓' : 'Semua jemaat ditandai Absen')
  }

  const clearWeek = () => {
    const w = ALL_WEEKS[weekIdx]
    const key = weekKey(w)
    setAttendance(prev => {
      const updated = { ...prev }
      delete updated[key]
      saveToServer(updated)
      return updated
    })
    showToast('Absensi minggu ini direset')
  }

  // Week stats
  const currentWeek = ALL_WEEKS[weekIdx]
  const currentKey  = weekKey(currentWeek)
  const weekData    = attendance[currentKey] || {}
  const hadirCount  = MEMBERS.filter(m => weekData[m] === 'hadir').length
  const absenCount  = MEMBERS.filter(m => weekData[m] === 'absent').length
  const markedCount = hadirCount + absenCount
  const pct         = markedCount > 0 ? Math.round(hadirCount / markedCount * 100) : null

  const filteredMembers = MEMBERS.filter(m => m.toLowerCase().includes(search.toLowerCase()))

  // Month report helpers
  function getAvailableMonths() {
    const seen = new Set()
    const result = []
    ALL_WEEKS.forEach(w => {
      const key = `${w.getFullYear()}-${w.getMonth()}`
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ key, year: w.getFullYear(), month: w.getMonth() })
      }
    })
    return result
  }

  function getWeeksForMonth(key) {
    if (!key) return []
    const [y, mo] = key.split('-').map(Number)
    return ALL_WEEKS.filter(w => w.getFullYear() === y && w.getMonth() === mo)
  }

  const availableMonths = getAvailableMonths()
  const reportWeeks     = getWeeksForMonth(selectedMonth)

  // Rekap totals
  function getMemberTotals(name) {
    let hadir = 0, absen = 0, blank = 0
    ALL_WEEKS.forEach(w => {
      const d = attendance[weekKey(w)] || {}
      if (d[name] === 'hadir') hadir++
      else if (d[name] === 'absent') absen++
      else blank++
    })
    const marked = hadir + absen
    const pctVal = marked > 0 ? Math.round(hadir / marked * 100) : 0
    return { hadir, absen, blank, pct: pctVal }
  }

  function exportCSV() {
    const weeks = reportWeeks
    if (!weeks.length) { showToast('Tidak ada data untuk diekspor'); return }
    let csv = 'Nama Jemaat'
    weeks.forEach(w => csv += `,${fmtDate(w)}`)
    csv += ',Total Hadir,%\n'
    MEMBERS.forEach(name => {
      let h = 0
      csv += name
      weeks.forEach(w => {
        const s = (attendance[weekKey(w)] || {})[name]
        csv += ',' + (s === 'hadir' ? 'H' : s === 'absent' ? 'A' : '-')
        if (s === 'hadir') h++
      })
      csv += `,${h},${Math.round(h / weeks.length * 100)}%\n`
    })
    const [y, mo] = selectedMonth.split('-').map(Number)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `Absensi_Kolom15_${MONTHS[mo]}_${y}.csv`; a.click()
    showToast('Export CSV berhasil!')
  }

  const progressPct = Math.round(((weekIdx + 1) / ALL_WEEKS.length) * 100)

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, flexDirection:'column' }}>
        <div className={styles.spinner}></div>
        <p style={{ color:'var(--gold-light)', fontSize:16 }}>Memuat data absensi...</p>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logoCross}>
          <i className="fa-solid fa-cross"></i>
        </div>
        <div>
          <h1 className={styles.headerTitle}>Kolom 15</h1>
          <p className={styles.headerSub}>Sistem Absensi Ibadah — Setiap Selasa</p>
        </div>
        <div className={styles.headerRight}>
          {syncStatus === 'saving' && <span className={styles.syncSaving}><i className="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...</span>}
          {syncStatus === 'saved' && <span className={styles.syncSaved}><i className="fa-solid fa-circle" style={{fontSize:8}}></i> Tersimpan</span>}
          {syncStatus === 'error' && <span className={styles.syncError}><i className="fa-solid fa-triangle-exclamation"></i> Gagal simpan</span>}
          {syncStatus === 'idle' && <span className={styles.syncIdle}><i className="fa-solid fa-cloud" style={{fontSize:12}}></i> Siap</span>}
        </div>
      </header>

      {/* NAV */}
      <nav className={styles.nav}>
        {[
          { id:'absensi', icon:'fa-clipboard-check', label:'Absensi' },
          { id:'report',  icon:'fa-chart-bar',       label:'Laporan Bulanan' },
          { id:'rekap',   icon:'fa-table',            label:'Rekap Kehadiran' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            className={`${styles.navBtn} ${page === id ? styles.navBtnActive : ''}`}
            onClick={() => setPage(id)}
          >
            <i className={`fa-solid ${icon}`}></i> {label}
          </button>
        ))}
      </nav>

      {/* ── PAGE: ABSENSI ── */}
      {page === 'absensi' && (
        <div className={styles.page}>
          {/* Week selector */}
          <div className={styles.weekSelector}>
            <button className={styles.btn} onClick={() => setWeekIdx(i => Math.max(0, i-1))} disabled={weekIdx === 0}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <span className={styles.weekBadge}>
                  <i className="fa-solid fa-calendar-week"></i>
                  Pertemuan {weekIdx+1} / {ALL_WEEKS.length}
                </span>
                <span className={styles.weekDateText}>Selasa, {fmtDate(currentWeek)}</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
            <button className={styles.btn} onClick={() => setWeekIdx(i => Math.min(ALL_WEEKS.length-1, i+1))} disabled={weekIdx === ALL_WEEKS.length-1}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.statGold}`}>
              <div className={styles.statVal}>{MEMBERS.length}</div>
              <div className={styles.statLbl}>Total Jemaat</div>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <div className={styles.statVal}>{hadirCount}</div>
              <div className={styles.statLbl}>Hadir</div>
            </div>
            <div className={`${styles.statCard} ${styles.statRed}`}>
              <div className={styles.statVal}>{absenCount}</div>
              <div className={styles.statLbl}>Tidak Hadir</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statVal} style={{ fontSize:22 }}>{pct !== null ? `${pct}%` : '—%'}</div>
              <div className={styles.statLbl}>Kehadiran</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className={styles.quickBtns}>
            <button className={`${styles.btn} ${styles.btnSm}`} onClick={() => markAll('hadir')}>
              <i className="fa-solid fa-check-double"></i> Semua Hadir
            </button>
            <button className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`} onClick={() => markAll('absent')}>
              <i className="fa-solid fa-xmark"></i> Semua Absen
            </button>
            <button className={`${styles.btn} ${styles.btnSm}`} onClick={clearWeek}>
              <i className="fa-solid fa-rotate-left"></i> Reset Minggu Ini
            </button>
          </div>

          {/* Search */}
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Cari nama jemaat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Member list */}
          <div className={styles.memberGrid}>
            {filteredMembers.map(name => {
              const status = weekData[name] || 'unmarked'
              return (
                <div key={name} className={styles.memberRow}>
                  <div className={styles.memberNum}>{MEMBERS.indexOf(name)+1}</div>
                  <div className={styles.memberName}>{name}</div>
                  <button
                    className={`${styles.toggleBtn} ${
                      status === 'hadir' ? styles.toggleHadir :
                      status === 'absent' ? styles.toggleAbsent :
                      styles.toggleUnmarked
                    }`}
                    onClick={() => toggleMember(name)}
                  >
                    {status === 'hadir' ? '✓ Hadir' : status === 'absent' ? '✗ Absen' : '— Tandai'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PAGE: LAPORAN BULANAN ── */}
      {page === 'report' && (
        <div className={styles.page}>
          <div className={styles.pageTopRow}>
            <h2 className={styles.pageTitle}>
              <i className="fa-solid fa-calendar-days" style={{color:'var(--gold)'}}></i>
              Laporan Bulanan
            </h2>
            <select
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map(({ key, year, month }) => (
                <option key={key} value={key}>{MONTHS[month]} {year}</option>
              ))}
            </select>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={exportCSV}>
              <i className="fa-solid fa-download"></i> Export CSV
            </button>
          </div>

          {reportWeeks.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-calendar-xmark"></i>
              <p>Tidak ada pertemuan pada bulan ini</p>
            </div>
          ) : (
            <>
              {/* Month stats */}
              <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.statGold}`}>
                  <div className={styles.statVal}>{reportWeeks.length}</div>
                  <div className={styles.statLbl}>Pertemuan</div>
                </div>
                <div className={`${styles.statCard} ${styles.statGreen}`}>
                  <div className={styles.statVal}>
                    {Math.round(
                      reportWeeks.reduce((sum, w) => {
                        const d = attendance[weekKey(w)] || {}
                        return sum + MEMBERS.filter(m => d[m] === 'hadir').length
                      }, 0) / reportWeeks.length
                    )}
                  </div>
                  <div className={styles.statLbl}>Rata-rata Hadir</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statVal} style={{fontSize:18}}>
                    {selectedMonth ? MONTHS[parseInt(selectedMonth.split('-')[1])] : '—'}
                  </div>
                  <div className={styles.statLbl}>Bulan Aktif</div>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{textAlign:'left', minWidth:160}}>Nama Jemaat</th>
                      {reportWeeks.map(w => <th key={weekKey(w)}>{fmtShort(w)}</th>)}
                      <th>Hadir</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map(name => {
                      let h = 0
                      const cells = reportWeeks.map(w => {
                        const s = (attendance[weekKey(w)] || {})[name]
                        if (s === 'hadir') h++
                        return { key: weekKey(w), status: s }
                      })
                      const p = Math.round(h / reportWeeks.length * 100)
                      return (
                        <tr key={name}>
                          <td style={{textAlign:'left'}}>{name}</td>
                          {cells.map(({ key, status }) => (
                            <td key={key} className={
                              status === 'hadir' ? styles.cellH :
                              status === 'absent' ? styles.cellA : styles.cellDash
                            }>
                              {status === 'hadir' ? 'H' : status === 'absent' ? 'A' : '—'}
                            </td>
                          ))}
                          <td className={styles.cellH}>{h}</td>
                          <td>
                            <span className={`${styles.pctBadge} ${p>=80?styles.pctHigh:p>=50?styles.pctMid:styles.pctLow}`}>
                              {p}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PAGE: REKAP ── */}
      {page === 'rekap' && (
        <div className={styles.page}>
          <div className={styles.pageTopRow}>
            <h2 className={styles.pageTitle}>
              <i className="fa-solid fa-table" style={{color:'var(--gold)'}}></i>
              Rekap Kehadiran
            </h2>
            <span style={{fontSize:13, color:'var(--muted)'}}>
              Total {ALL_WEEKS.length} pertemuan (Jan – Nov 2026)
            </span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{textAlign:'left', minWidth:160}}>Nama Jemaat</th>
                  <th>Total Hadir</th>
                  <th>Total Absen</th>
                  <th>Belum Diisi</th>
                  <th>% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map(name => {
                  const { hadir, absen, blank, pct: p } = getMemberTotals(name)
                  return (
                    <tr key={name}>
                      <td style={{textAlign:'left'}}>{name}</td>
                      <td className={styles.cellH}>{hadir}</td>
                      <td className={styles.cellA}>{absen}</td>
                      <td className={styles.cellDash}>{blank}</td>
                      <td>
                        <span className={`${styles.pctBadge} ${p>=80?styles.pctHigh:p>=50?styles.pctMid:styles.pctLow}`}>
                          {p}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
