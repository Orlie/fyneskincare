import React, { useState } from 'react';
import Card from './Card'; // Corrected: default import
import ProductDetailsPage from './ProductDetailsPage'; // Corrected: imports from its own file

function ProductList({ products, onCreateTask, requests }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

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
    <div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Filter by title"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 rounded-md bg-white/10 text-white"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 rounded-md bg-white/10 text-white"
        >
          <option value="title">Sort by Title</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedProducts.map(product => (
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
    </div>
  );
}

export default ProductList;