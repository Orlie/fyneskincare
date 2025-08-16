import React, { useState, useMemo } from 'react';
import Card from './Card';
import ProductDetailsPage from './ProductDetailsPage';

const ITEMS_PER_PAGE = 20;

function ProductList({ products, onCreateTask, requests }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category))].sort(), 
    [products]
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const filteredProducts = useMemo(() => 
    products.filter(product =>
      product.title.toLowerCase().includes(filter.toLowerCase()) &&
      (categoryFilter === '' || product.category === categoryFilter)
    ), [products, filter, categoryFilter]);

  const sortedProducts = useMemo(() => 
    [...filteredProducts].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    }), [filteredProducts, sortBy]);

  const paginatedProducts = useMemo(() => 
    sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [sortedProducts, currentPage]
  );

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: '#ffffff', padding: '20px' }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-base"
        />
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-base"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-base"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map(product => (
          <Card key={product.id} className="p-4 flex flex-col bg-gray-800 rounded-xl" onClick={() => handleProductClick(product)}>
            <img src={product.image} alt={product.title} className="w-full h-40 object-cover rounded-lg mb-4" />
            <div className="flex-grow flex flex-col">
              <h3 className="text-base font-semibold mb-2 truncate">{product.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{product.category}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onCreateTask(product); }}
                className="w-full mt-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold transition-colors"
              >
                Create Task
              </button>
            </div>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            className="p-2 px-4 rounded-lg bg-gray-800 text-white text-base disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-base mx-4">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            className="p-2 px-4 rounded-lg bg-gray-800 text-white text-base disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;