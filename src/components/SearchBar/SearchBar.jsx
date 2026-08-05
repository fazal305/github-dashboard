import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

function SearchBar({
  placeholder = 'Search…',
  defaultValue = '',
  ariaLabel = 'Search',
  autoFocus = false,
  onSubmit,
}) {
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed && onSubmit) onSubmit(trimmed);
  }

  return (
    <form className="gd-search-bar" role="search" onSubmit={handleSubmit}>
      <FiSearch className="gd-search-bar__icon" size={16} aria-hidden="true" />
      <label htmlFor="gd-search-input" className="visually-hidden">
        {ariaLabel}
      </label>
      <input
        id="gd-search-input"
        type="search"
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="gd-btn-icon gd-search-bar__clear"
          aria-label="Clear search"
          onClick={() => setValue('')}
        >
          <FiX size={14} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

export default SearchBar;
