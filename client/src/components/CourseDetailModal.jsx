import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import '../styles/CourseDetailModal.css';

const AREA_COLORS = {
  Finance: '#3b82f6', GMPP: '#8b5cf6', ISM: '#14b8a6',
  Marketing: '#f97316', 'OB/HR': '#22c55e', Operations: '#eab308',
  Strategy: '#ec4899', 'Inter-Area': '#64748b',
};

const AREAS   = ['Finance','GMPP','ISM','Marketing','OB/HR','Operations','Strategy','Inter-Area'];
const TERMS   = ['Term IV','Term V','Term VI'];
const CREDITS = [1.5, 2, 2.5, 3, 4, 6];

function avg(reviews, field) {
  if (!reviews.length) return 0;
  const valid = reviews.filter(r => r[field] > 0);
  if (!valid.length) return 0;
  return valid.reduce((s, r) => s + r[field], 0) / valid.length;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CourseDetailModal({ course: initialCourse, onClose, onCourseUpdated, inBasket, onToggleBasket }) {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  // ── course data (admin may edit) ─────────────────────────────────────────
  const [course,   setCourse]   = useState(initialCourse);
  const [editing,  setEditing]  = useState(false);
  const [editDraft, setEditDraft] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  // ── reviews ───────────────────────────────────────────────────────────────
  const [reviews,  setReviews]  = useState([]);
  const [revLoad,  setRevLoad]  = useState(true);

  // ── review form ───────────────────────────────────────────────────────────
  const [cRating,  setCRating]  = useState(0);
  const [pRating,  setPRating]  = useState(0);
  const [comment,  setComment]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErr,  setFormErr]  = useState('');

  // close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // fetch reviews
  const fetchReviews = useCallback(() => {
    setRevLoad(true);
    fetch(`/api/reviews/${course.id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setRevLoad(false));
  }, [course.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── admin edit ────────────────────────────────────────────────────────────
  const startEdit = () => {
    setEditDraft({
      course:      course.course,
      faculty:     course.faculty,
      area:        course.area,
      term:        course.term,
      credits:     course.credits,
      description: course.description || '',
    });
    setSaveErr('');
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveErr('');
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(editDraft),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setCourse(updated);
      setEditing(false);
      onCourseUpdated && onCourseUpdated(updated);
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── submit review ─────────────────────────────────────────────────────────
  const submitReview = async (e) => {
    e.preventDefault();
    if (!cRating && !pRating && !comment.trim()) {
      setFormErr('Please provide at least a rating or a comment.');
      return;
    }
    setFormErr('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${course.id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username:     user.username,
          name:         user.name,
          courseRating: cRating,
          profRating:   pRating,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Submit failed');
      setCRating(0); setPRating(0); setComment('');
      fetchReviews();
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── admin delete review ───────────────────────────────────────────────────
  const deleteReview = async (reviewId) => {
    await fetch(`/api/reviews/${course.id}/${reviewId}`, { method: 'DELETE' });
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const color     = AREA_COLORS[course.area] || '#64748b';
  const avgCourse = avg(reviews, 'courseRating');
  const avgProf   = avg(reviews, 'profRating');

  return (
    <div className="cdm-backdrop" onClick={onClose}>
      <div className="cdm-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="cdm-header" style={{ borderTopColor: color }}>
          <div className="cdm-header-top">
            <span className="cdm-area-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
              {course.area}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isAdmin && !editing && (
                <button className="cdm-edit-btn" onClick={startEdit}>Edit Course</button>
              )}
              <button className="cdm-close" onClick={onClose}>✕</button>
            </div>
          </div>

          {editing ? (
            /* ── Admin edit form ── */
            <div className="cdm-edit-form">
              <div className="cdm-edit-row">
                <label>Course Name</label>
                <input value={editDraft.course} onChange={e => setEditDraft(d => ({ ...d, course: e.target.value }))} />
              </div>
              <div className="cdm-edit-grid">
                <div className="cdm-edit-row">
                  <label>Faculty</label>
                  <input value={editDraft.faculty} onChange={e => setEditDraft(d => ({ ...d, faculty: e.target.value }))} />
                </div>
                <div className="cdm-edit-row">
                  <label>Area</label>
                  <select value={editDraft.area} onChange={e => setEditDraft(d => ({ ...d, area: e.target.value }))}>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="cdm-edit-row">
                  <label>Term</label>
                  <select value={editDraft.term} onChange={e => setEditDraft(d => ({ ...d, term: e.target.value }))}>
                    {TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="cdm-edit-row">
                  <label>Credits</label>
                  <select value={editDraft.credits} onChange={e => setEditDraft(d => ({ ...d, credits: parseFloat(e.target.value) }))}>
                    {CREDITS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="cdm-edit-row">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editDraft.description}
                  placeholder="Add a short course description…"
                  onChange={e => setEditDraft(d => ({ ...d, description: e.target.value }))}
                />
              </div>
              {saveErr && <p className="cdm-err">{saveErr}</p>}
              <div className="cdm-edit-actions">
                <button className="cdm-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                <button className="cdm-save-btn" onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="cdm-title">{course.course}</h2>
              <div className="cdm-meta-pills">
                <span className="cdm-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {course.faculty}
                </span>
                <span className="cdm-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {course.term}
                </span>
                <span className="cdm-pill cdm-credits-pill">
                  {course.credits ? `${course.credits} Credits` : 'Credits TBD'}
                </span>
              </div>
              {course.description && (
                <p className="cdm-description">{course.description}</p>
              )}
            </>
          )}
        </div>

        {/* ── Add-to-planner button ── */}
        {!editing && (
          <div className="cdm-planner-row">
            <button
              className={`cdm-planner-btn ${inBasket ? 'in-basket' : ''}`}
              onClick={() => onToggleBasket && onToggleBasket(course)}
            >
              {inBasket ? '✓ Added to Planner' : '+ Add to Planner'}
            </button>
          </div>
        )}

        {/* ── Aggregate ratings ── */}
        {!editing && reviews.length > 0 && (
          <div className="cdm-agg">
            <div className="cdm-agg-item">
              <span className="cdm-agg-label">Course Rating</span>
              <StarRating value={Math.round(avgCourse)} readOnly size={18} />
              <span className="cdm-agg-val">{avgCourse.toFixed(1)} / 5</span>
            </div>
            <div className="cdm-agg-divider" />
            <div className="cdm-agg-item">
              <span className="cdm-agg-label">Professor Rating</span>
              <StarRating value={Math.round(avgProf)} readOnly size={18} />
              <span className="cdm-agg-val">{avgProf.toFixed(1)} / 5</span>
            </div>
            <div className="cdm-agg-divider" />
            <div className="cdm-agg-item">
              <span className="cdm-agg-label">Reviews</span>
              <span className="cdm-agg-count">{reviews.length}</span>
            </div>
          </div>
        )}

        <div className="cdm-body">

          {/* ── Review form (students only) ── */}
          {!isAdmin && (
            <section className="cdm-section">
              <h3 className="cdm-section-title">Rate This Course</h3>
              <form className="cdm-review-form" onSubmit={submitReview}>
                <div className="cdm-rating-row">
                  <div className="cdm-rating-group">
                    <span className="cdm-rating-label">Course</span>
                    <StarRating value={cRating} onChange={setCRating} />
                    <span className="cdm-rating-hint">{cRating ? `${cRating}/5` : 'Tap to rate'}</span>
                  </div>
                  <div className="cdm-rating-group">
                    <span className="cdm-rating-label">Professor</span>
                    <StarRating value={pRating} onChange={setPRating} />
                    <span className="cdm-rating-hint">{pRating ? `${pRating}/5` : 'Tap to rate'}</span>
                  </div>
                </div>
                <textarea
                  className="cdm-comment-input"
                  rows={3}
                  placeholder="Share your thoughts about this course, workload, learning outcomes…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                {formErr && <p className="cdm-err">{formErr}</p>}
                <button className="cdm-submit-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </section>
          )}

          {/* ── Comments list ── */}
          <section className="cdm-section">
            <h3 className="cdm-section-title">
              Student Reviews
              {reviews.length > 0 && <span className="cdm-review-count">{reviews.length}</span>}
            </h3>

            {revLoad ? (
              <p className="cdm-muted">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <div className="cdm-no-reviews">
                <p>No reviews yet.</p>
                {!isAdmin && <p>Be the first to rate this course!</p>}
              </div>
            ) : (
              <div className="cdm-reviews-list">
                {reviews.map(r => (
                  <div className="cdm-review-card" key={r.id}>
                    <div className="cdm-review-top">
                      <div className="cdm-reviewer-info">
                        <div className="cdm-avatar">{r.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <span className="cdm-reviewer-name">{r.name}</span>
                          <span className="cdm-review-date">{fmtDate(r.timestamp)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isAdmin && (
                          <button
                            className="cdm-delete-review"
                            onClick={() => deleteReview(r.id)}
                            title="Delete review"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>

                    {(r.courseRating > 0 || r.profRating > 0) && (
                      <div className="cdm-review-ratings">
                        {r.courseRating > 0 && (
                          <span className="cdm-mini-rating">
                            Course: <StarRating value={r.courseRating} readOnly size={13} />
                          </span>
                        )}
                        {r.profRating > 0 && (
                          <span className="cdm-mini-rating">
                            Prof: <StarRating value={r.profRating} readOnly size={13} />
                          </span>
                        )}
                      </div>
                    )}

                    {r.comment && <p className="cdm-review-comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
