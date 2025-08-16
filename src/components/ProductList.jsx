import React, { useState, useMemo } from 'react';
import Card from './Card';
import ProductDetailsPage from './ProductDetailsPage';

function ProductList({ products, onCreateTask, requests }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setSortBy('newest');
  };

  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(product => product.category));
    return ['All', ...Array.from(categories).sort()];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'All') {
      result = result.filter(product => product.category === categoryFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        // Assuming product.createdAt exists and is a comparable date string or timestamp
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [products, searchTerm, categoryFilter, sortBy]);

  if (selectedProduct) {
    const myTask = requests.find(req => req.productId === selectedProduct.id);
    return (
      <ProductDetailsPage
        product={selectedProduct}
        onBack={handleBack}
        onCreateTask={onCreateTask}
        myTask={myTask}
      />
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Available Products</h2>

      <div className="bg-white/5 p-4 rounded-lg shadow-inner mb-6 flex flex-wrap gap-4 items-center">
        <label htmlFor="search" className="sr-only">Search Products</label>
        <input
          id="search"
          type="text"
          placeholder="Search by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label htmlFor="category" className="sr-only">Filter by Category</label>
        <select
          id="category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {availableCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label htmlFor="sort" className="sr-only">Sort Products</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="title-asc">Sort by: Title (A-Z)</option>
          <option value="title-desc">Sort by: Title (Z-A)</option>
        </select>

        {(searchTerm || categoryFilter !== 'All' || sortBy !== 'newest') && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <p className="text-white/70 text-center text-lg">No products found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <Card key={product.id} className="p-5 flex flex-col" onClick={() => handleProductClick(product)}>
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-md mb-4 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-white mb-2 flex-grow">{product.title}</h3>
              <p className="text-sm text-white/70 mb-2">Category: <span className="font-medium text-white">{product.category}</span></p>
              {/* Assuming product has a price and commission property */}
              {product.price && <p className="text-sm text-white/70 mb-2">Price: <span className="font-medium text-white">${product.price.toFixed(2)}</span></p>}
              {product.commission && <p className="text-sm text-white/70 mb-4">Commission: <span className="font-medium text-white">{product.commission}%</span></p>}
              <button
                onClick={(e) => { e.stopPropagation(); onCreateTask(product); }}
                className="mt-auto w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold transition-colors text-white"
              >
                Create Task
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;