import React, { useState, useEffect } from 'react';

function SearchBar({ validItems, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    const results = validItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serial.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    onSearch(results);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, validItems]);

  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="חיפוש לפי שם מוצר יצרן או מספר סידורי"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
