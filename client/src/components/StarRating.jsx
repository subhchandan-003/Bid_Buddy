import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            fontSize:  size,
            cursor:    readOnly ? 'default' : 'pointer',
            color:     star <= display ? '#f0a500' : 'rgba(255,255,255,0.18)',
            transition: 'color 0.1s, transform 0.1s',
            transform:  !readOnly && star <= display ? 'scale(1.15)' : 'scale(1)',
            display:    'inline-block',
            lineHeight: 1,
          }}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
