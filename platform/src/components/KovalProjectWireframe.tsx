import React from 'react'

interface KovalProjectWireframeProps {
  projectId: string
}

const ERP_MODULES = [
  'GL & BANKING',
  'INVENTORY',
  'AP / AR',
  'HR & PAYROLL',
  'FIXED ASSETS',
  'MANUFACTURING',
]

const PYRIX_NAV = ['COMPANIES', 'SQL INSPECTOR', 'WORKFLOWS', 'AUDIT LOG']

const PYRIX_ROWS: Array<{ key: string; state: string }> = [
  { key: 'SCHEMA_CHECK', state: 'OK' },
  { key: 'QUERY_CACHE', state: 'ACTIVE' },
  { key: 'SESSION_GUARD', state: 'ON' },
]

export const KovalProjectWireframe: React.FC<KovalProjectWireframeProps> = ({ projectId }) => {
  if (projectId === 'erp') {
    return (
      <div className="flex w-full flex-col justify-between border border-[#111110]/25 bg-white text-[#111110] transition-colors group-hover:border-[#111110]">
        <div className="flex items-center justify-between bg-[#111110] px-3 py-2 font-mono text-[10px] tracking-[0.06em] text-white">
          <span>ERP // .NET 10 + SQL SERVER</span>
          <span>80 TABLES</span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#F4F4F2] p-3 sm:grid-cols-3">
          {ERP_MODULES.map((mod) => (
            <div
              key={mod}
              className="border border-[#111110]/20 bg-white px-2 py-2.5 text-center font-mono text-[9px] tracking-[0.04em] text-[#111110]"
            >
              {mod}
            </div>
          ))}
        </div>

        <div className="border-t border-[#111110]/15 bg-white px-3 py-2 font-mono text-[9px] tracking-[0.06em] text-[#656561]">
          TENANT ISOLATION · EF CORE + DAPPER · AUDIT TRAIL
        </div>
      </div>
    )
  }

  if (projectId === 'pyrix') {
    return (
      <div className="flex w-full flex-col justify-between border border-[#111110]/25 bg-white text-[#111110] transition-colors group-hover:border-[#111110]">
        <div className="flex items-center justify-between bg-[#111110] px-3 py-2 font-mono text-[10px] tracking-[0.06em] text-white">
          <span>PYRIX // FASTAPI + ODBC 18</span>
          <span>TTL CACHE</span>
        </div>

        <div className="grid grid-cols-12 bg-[#F4F4F2] p-3">
          <div className="col-span-5 space-y-1 border-r border-[#111110]/15 pr-2">
            {PYRIX_NAV.map((item) => (
              <div
                key={item}
                className="border border-[#111110]/15 bg-white px-2 py-1 font-mono text-[9px] text-[#3A3A38]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="col-span-7 space-y-1.5 pl-2.5">
            {PYRIX_ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between border border-[#111110]/20 bg-white px-2.5 py-1.5 font-mono text-[9px]"
              >
                <span className="text-[#3A3A38]">{row.key}</span>
                <span className="bg-[#111110] px-1.5 py-0.5 text-[8px] text-white">
                  {row.state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#111110]/15 bg-white px-3 py-2 font-mono text-[9px] tracking-[0.06em] text-[#656561]">
          MULTI-COMPANY OPS · DYNAMIC TABLES &amp; FORMS
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-44 w-full flex-col justify-between border border-[#111110]/25 bg-[#F4F4F2] p-4 text-[#111110] transition-colors group-hover:border-[#111110]">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
        SYSTEM ARCHITECTURE
      </div>
      <div className="font-mono text-xs uppercase tracking-[0.06em]">
        {projectId.toUpperCase()}
      </div>
    </div>
  )
}
