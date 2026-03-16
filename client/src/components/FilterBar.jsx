import { useState } from 'react';
import '../styles/FilterBar.css';

const AREA_COLORS = {
  Finance:      '#3b82f6',
  GMPP:         '#8b5cf6',
  ISM:          '#14b8a6',
  Marketing:    '#f97316',
  'OB/HR':      '#22c55e',
  Operations:   '#eab308',
  Strategy:     '#ec4899',
  'Inter-Area': '#64748b',
};

export default function FilterBar({
  search, setSearch,
  areas, selectedAreas, toggleArea,
  selectedCredit, setSelectedCredit,
  faculties, selectedFaculty, setSelectedFaculty,
  terms, selectedTerm, setSelectedTerm,
  clearAll, hasFilters,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const filterContent = (
    <div className="mobile-panel" style={mobileOpen ? { display: 'flex' } : {}}>
      {/* Search */}
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search courses, faculty…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-divider" />

      {/* Area pills */}
      <div className="area-pills">
        {areas.map(area => {
          const color = AREA_COLORS[area] || '#64748b';
          const active = selectedAreas.includes(area);
          return (
            <button
              key={area}
              className={`area-pill ${active ? 'active' : ''}`}
              style={{
                borderColor: active ? color : 'transparent',
                backgroundColor: active ? `${color}22` : undefined,
                color: active ? color : 'var(--text-muted)',
              }}
              onClick={() => toggleArea(area)}
            >
              {area}
            </button>
          );
        })}
      </div>

      <div className="filter-divider" />

      {/* Credits */}
      <div className="credits-group">
        <span className="credits-label">Credits</span>
        <div className="credits-toggle">
          {['all', '1.5', '3'].map(val => (
            <button
              key={val}
              className={`credits-btn ${selectedCredit === val ? 'active' : ''}`}
              onClick={() => setSelectedCredit(val)}
            >
              {val === 'all' ? 'All' : val}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Term */}
      <div className="credits-group">
        <span className="credits-label">Term</span>
        <div className="credits-toggle">
          <button
            className={`credits-btn ${selectedTerm === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTerm('all')}
          >All</button>
          {terms.map(t => (
            <button
              key={t}
              className={`credits-btn ${selectedTerm === t ? 'active' : ''}`}
              onClick={() => setSelectedTerm(t)}
            >
              {t === 'X' ? 'N/A' : t.replace('Term ', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Faculty */}
      <div className="faculty-wrap">
        <select
          className="faculty-select"
          value={selectedFaculty}
          onChange={e => setSelectedFaculty(e.target.value)}
        >
          <option value="">All Faculty</option>
          {faculties.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button className="clear-btn" onClick={clearAll}>✕ Clear</button>
      )}
    </div>
  );

  return (
    <div className="filter-bar">
      <div className="filter-inner">
        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(o => !o)}>
          <span>🎛 Filters {selectedAreas.length > 0 || hasFilters ? `(active)` : ''}</span>
          <span>{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {filterContent}
      </div>
    </div>
  );
}
