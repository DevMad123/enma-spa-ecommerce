import React, { useState, useRef } from 'react';

const SearchAutocomplete = ({ onSearch, suggestions, loading }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef();

  // Debounce handled in parent
  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery('');
    window.location.href = suggestion.url || `/shop/${suggestion.id}`;
  };

  return (
    <div className="relative w-64">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search products..."
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        aria-activedescendant={suggestions.length > 0 ? `suggestion-0` : undefined}
      />
      {loading && <span className="absolute right-2 top-2 text-gray-400 animate-spin">⏳</span>}
      {suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow-lg z-10"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id}
              id={`suggestion-${idx}`}
              role="option"
              tabIndex={0}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
              onClick={() => handleSuggestionClick(s)}
              onKeyDown={e => e.key === 'Enter' && handleSuggestionClick(s)}
            >
              {s.thumbnail && <img src={s.thumbnail} alt="" className="w-6 h-6 mr-2 rounded" />}
              <span>{s.title || s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(SearchAutocomplete);