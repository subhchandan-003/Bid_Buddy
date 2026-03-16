import { useState, useEffect, useMemo, useRef } from 'react';
import API from '../lib/api';

export function useCourses() {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [search,        setSearch]        = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedTerm, setSelectedTerm]   = useState('all');

  const filterVersion = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    fetch(`${API}/api/courses`)
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then(data => { setAllCourses(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const areas    = useMemo(() => [...new Set(allCourses.map(c => c.area))].sort(), [allCourses]);
  const faculties = useMemo(() => [...new Set(allCourses.map(c => c.faculty))].sort(), [allCourses]);
  const terms    = useMemo(() => {
    const order = ['Term IV', 'Term V', 'Term VI', 'X'];
    const unique = [...new Set(allCourses.map(c => c.term))];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [allCourses]);

  const filtered = useMemo(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      filterVersion.current += 1;
    }
    let result = allCourses;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.course.toLowerCase().includes(q) ||
        c.faculty.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }

    if (selectedAreas.length > 0) {
      result = result.filter(c => selectedAreas.includes(c.area));
    }

    if (selectedCredit !== 'all') {
      result = result.filter(c => c.credits === parseFloat(selectedCredit));
    }

    if (selectedFaculty) {
      const q = selectedFaculty.toLowerCase();
      result = result.filter(c => c.faculty.toLowerCase().includes(q));
    }

    if (selectedTerm !== 'all') {
      result = result.filter(c => c.term === selectedTerm);
    }

    return result;
  }, [allCourses, search, selectedAreas, selectedCredit, selectedFaculty, selectedTerm]);

  const toggleArea = (area) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const clearAll = () => {
    setSearch('');
    setSelectedAreas([]);
    setSelectedCredit('all');
    setSelectedFaculty('');
    setSelectedTerm('all');
  };

  const hasFilters = search || selectedAreas.length > 0 || selectedCredit !== 'all' || selectedFaculty || selectedTerm !== 'all';

  return {
    loading, error,
    filtered, allCourses,
    areas, faculties, terms,
    search, setSearch,
    selectedAreas, toggleArea,
    selectedCredit, setSelectedCredit,
    selectedFaculty, setSelectedFaculty,
    selectedTerm, setSelectedTerm,
    clearAll, hasFilters,
    filterVersion,
  };
}
