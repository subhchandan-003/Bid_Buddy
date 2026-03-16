import CourseCard from './CourseCard';
import '../styles/CourseCard.css';

export default function CourseGrid({ courses, total, filterVersion, basket, toggleBasket, onExpand }) {
  const version = filterVersion.current;

  return (
    <main className="course-grid-wrap">
      <div className="results-bar">
        <p className="results-count">
          Showing <span>{courses.length}</span> of {total} courses
        </p>
        {basket.size > 0 && (
          <p className="results-count">
            <span>{basket.size}</span> courses in planner
          </p>
        )}
        {basket.size === 0 && (
          <p className="results-count" style={{ fontStyle: 'italic' }}>Click a card to view details & add to planner</p>
        )}
      </div>

      <div className="course-grid">
        {courses.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No courses found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          courses.map((c, i) => (
            <div
              key={`${c.id}-${version}`}
              className={`card-wrapper ${version === 0 ? 'anim-initial' : 'anim-filter'}`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.4)}s` }}
            >
              <CourseCard course={c} selected={basket.has(c.id)} onToggle={toggleBasket} onExpand={onExpand} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
