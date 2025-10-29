import React from 'react';

export default function CategoryPills({ categories, activeCategory, onSelect }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const handleSelect = (category) => {
    if (onSelect) {
      onSelect(category);
    }
  };

  return (
    <div className="category-pills" role="tablist" aria-label="Filtriraj po kategoriji">
      <button
        type="button"
        className={`category-pill ${!activeCategory ? 'category-pill--active' : ''}`}
        onClick={() => handleSelect(null)}
      >
        Sve kategorije
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          className={`category-pill ${activeCategory === category ? 'category-pill--active' : ''}`}
          onClick={() => handleSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
