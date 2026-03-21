import '../styles/CreditTracker.css';

const TERM_RULES = [
  { key: 'Term IV',  label: 'Term 4', min: 18, max: 21 },
  { key: 'Term V',   label: 'Term 5', min: 18, max: 21 },
  { key: 'Term VI',  label: 'Term 6', min: 12, max: 12 },
];

const fmtCr = (v) => (v % 1 === 0 ? String(v) : v.toFixed(1));

export default function CreditTracker({ basketCourses }) {
  const totalCredits = basketCourses.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div className="credit-tracker">
      <div className="ct-inner">
        {TERM_RULES.map(({ key, label, min, max }) => {
          const used = basketCourses
            .filter(c => c.term === key)
            .reduce((s, c) => s + (c.credits || 0), 0);

          const remaining = Math.max(0, min - used);
          const over = used > max;
          const done = used >= min && used <= max;
          const pct  = Math.min(100, max > 0 ? (used / max) * 100 : 0);

          let status = 'empty';
          if (over)       status = 'over';
          else if (done)  status = 'ok';
          else if (used > 0) status = 'partial';

          return (
            <div key={key} className={`ct-term ct-${status}`}>
              <div className="ct-term-top">
                <span className="ct-term-label">{label}</span>
                <span className="ct-term-counts">
                  <span className="ct-used">{fmtCr(used)}</span>
                  <span className="ct-sep">/</span>
                  <span className="ct-max">{min === max ? min : `${min}–${max}`} cr</span>
                </span>
              </div>
              <div className="ct-bar-track">
                <div
                  className="ct-bar-fill"
                  style={{ width: `${pct}%` }}
                />
                {min !== max && (
                  <div
                    className="ct-bar-min-mark"
                    style={{ left: `${(min / max) * 100}%` }}
                    title={`Min ${min} cr`}
                  />
                )}
              </div>
              <div className="ct-term-hint">
                {over    && <span className="ct-hint-over">↓ {fmtCr(used - max)} cr over limit</span>}
                {done    && <span className="ct-hint-ok">✓ Complete</span>}
                {!over && !done && remaining > 0 && (
                  <span className="ct-hint-rem">{fmtCr(remaining)} cr to go</span>
                )}
              </div>
            </div>
          );
        })}

        <div className="ct-total">
          <span className="ct-total-label">Total</span>
          <span className="ct-total-value">{fmtCr(totalCredits)}</span>
          <span className="ct-total-range">/ 48–52 cr</span>
        </div>
      </div>
    </div>
  );
}
