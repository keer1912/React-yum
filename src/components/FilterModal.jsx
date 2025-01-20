import React from 'react';
import Modal from 'react-modal';

// Bind modal to your appElement for accessibility
Modal.setAppElement('#root');

const FilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const cuisines = [
    "Italian", "Chinese", "Mexican", "Indian", 
    "Japanese", "Thai", "Mediterranean", "French"
  ];

  const diets = [
    "Vegetarian", "Vegan", "Gluten-Free", 
    "Keto", "Paleo", "Low-Carb"
  ];

  const handleCuisineChange = (cuisine) => {
    setFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const handleDietChange = (diet) => {
    setFilters(prev => ({
      ...prev,
      diets: prev.diets.includes(diet)
        ? prev.diets.filter(d => d !== diet)
        : [...prev.diets, diet]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto border shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <h2 className="text-2xl font-bold mb-4 font-roboto-sans">Add Filters</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 font-roboto-sans">Cuisines</h3>
        <div className="grid grid-cols-2 gap-2">
          {cuisines.map(cuisine => (
            <label key={cuisine} className="flex items-center space-x-2 font-space-mono">
              <input
                type="checkbox"
                checked={filters.cuisines.includes(cuisine)}
                onChange={() => handleCuisineChange(cuisine)}
                className="form-checkbox"
              />
              <span>{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 font-roboto-sans">Dietary Restrictions</h3>
        <div className="grid grid-cols-2 gap-2">
          {diets.map(diet => (
            <label key={diet} className="flex items-center space-x-2 font-space-mono">
              <input
                type="checkbox"
                checked={filters.diets.includes(diet)}
                onChange={() => handleDietChange(diet)}
                className="form-checkbox"
              />
              <span>{diet}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-100 font-space-mono"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#fabd00] text-black rounded hover:bg-[#D9A500] font-roboto-mono"
        >
          Apply Filters
        </button>
      </div>
    </Modal>
  );
};

export default FilterModal;