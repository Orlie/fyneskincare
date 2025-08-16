import React, { useState } from 'react';
import { Card } from './Card';
import ProductDetailsPage from '../../App';

function ProductList({ products, onCreateTask, requests }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map(product => (
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
  );
}

export default ProductList;
