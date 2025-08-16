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
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ 
            padding: '12px 18px', 
            borderRadius: '12px', 
            border: '1px solid #555555', 
            backgroundColor: '#444444', 
            color: '#ffffff', 
            fontSize: '16px',
            width: '300px'
          }}
        />
        <div style={{ display: 'flex', gap: '20px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ 
              padding: '12px 18px', 
              borderRadius: '12px', 
              border: '1px solid #555555', 
              backgroundColor: '#444444', 
              color: '#ffffff', 
              fontSize: '16px' 
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '12px 18px', 
              borderRadius: '12px', 
              border: '1px solid #555555', 
              backgroundColor: '#444444', 
              color: '#ffffff', 
              fontSize: '16px' 
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map(product => (
          <Card key={product.id} className="p-4" onClick={() => handleProductClick(product)}>
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
            <p className="text-sm text-white/70 mb-4">{product.category}</p>
            <button
              onClick={(e) => { e.stopPropagation(); onCreateTask(product); }}
              className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold transition-colors"
            >
              Create Task
            </button>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px', 
              border: '1px solid #555555', 
              backgroundColor: '#444444', 
              color: '#ffffff', 
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '16px' }}>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '12px', 
              border: '1px solid #555555', 
              backgroundColor: '#444444', 
              color: '#ffffff', 
              fontSize: '16px',
              cursor: 'pointer',
              marginLeft: '10px',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;