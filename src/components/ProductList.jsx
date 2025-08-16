import React, { useState, useMemo } from 'react';
import Card from './Card';
import ProductDetailsPage from './ProductDetailsPage';
import { Badge } from "./common";
import { cx } from "./common/utils";

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

    if (searchTerm) {
      result = result.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(product => product.category === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
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
      <h2 className="text-2xl font-semibold text-white mb-6">Available Products</h2>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <label htmlFor="search" className="sr-only">Search Products</label>
          <input
            id="search"
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2.5 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />

          <label htmlFor="category" className="sr-only">Filter by Category</label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
            className="p-2.5 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="title-asc">Sort by: Title (A-Z)</option>
            <option value="title-desc">Sort by: Title (Z-A)</option>
          </select>

          {(searchTerm || categoryFilter !== 'All' || sortBy !== 'newest') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {filteredAndSortedProducts.length === 0 ? (
        <p className="text-white/70 text-center text-lg">No products found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <Card key={product.id} className="p-5 flex flex-col" onClick={() => handleProductClick(product)}>
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-lg mb-4 flex-shrink-0 border border-white/10" />
              <h3 className="text-xl font-semibold text-white mb-2 flex-grow">{product.title}</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>Category: {product.category}</Badge>
                {product.commission && <Badge>Commission: {product.commission}%</Badge>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onCreateTask(product); }}
                className="mt-auto w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors text-white"
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