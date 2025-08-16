import React, { useState } from 'react';
import Card from './Card'; // Assuming Card is styled consistently

function AdminProductManager({ setProducts, showToast }) {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [importedData, setImportedData] = useState(null);

  const handleImport = async () => {
    setMessage('Importing...');
    setImportedData(null);

    // Simulating a successful import after a delay
    try {
      // In a real application, you would send this URL to a backend
      // The backend would fetch, parse, validate, and store the products.
      // For this frontend-only simulation, we'll just create dummy data.
      const simulatedProducts = [
        { id: 'p101', title: 'Simulated Product 1', category: 'Electronics', price: 29.99, commission: 10, createdAt: new Date().toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p102', title: 'Simulated Product 2', category: 'Books', price: 15.00, commission: 5, createdAt: new Date(Date.now() - 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p103', title: 'Simulated Product 3', category: 'Apparel', price: 55.00, commission: 12, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p104', title: 'Simulated Product 4', category: 'Home Goods', price: 35.50, commission: 8, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p105', title: 'Simulated Product 5', category: 'Electronics', price: 120.00, commission: 15, createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p106', title: 'Simulated Product 6', category: 'Books', price: 22.00, commission: 7, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p107', title: 'Simulated Product 7', category: 'Apparel', price: 70.00, commission: 11, createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p108', title: 'Simulated Product 8', category: 'Home Goods', price: 45.00, commission: 9, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p109', title: 'Simulated Product 9', category: 'Electronics', price: 80.00, commission: 13, createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p110', title: 'Simulated Product 10', category: 'Books', price: 18.00, commission: 6, createdAt: new Date(Date.now() - 9 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p111', title: 'Simulated Product 11', category: 'Apparel', price: 60.00, commission: 10, createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p112', title: 'Simulated Product 12', category: 'Home Goods', price: 25.00, commission: 7, createdAt: new Date(Date.now() - 11 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p113', title: 'Simulated Product 13', category: 'Electronics', price: 95.00, commission: 14, createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p114', title: 'Simulated Product 14', category: 'Books', price: 30.00, commission: 8, createdAt: new Date(Date.now() - 13 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p115', title: 'Simulated Product 15', category: 'Apparel', price: 40.00, commission: 9, createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p116', title: 'Simulated Product 16', category: 'Home Goods', price: 50.00, commission: 10, createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p117', title: 'Simulated Product 17', category: 'Electronics', price: 65.00, commission: 11, createdAt: new Date(Date.now() - 16 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p118', title: 'Simulated Product 18', category: 'Books', price: 12.00, commission: 4, createdAt: new Date(Date.now() - 17 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p119', title: 'Simulated Product 19', category: 'Apparel', price: 85.00, commission: 14, createdAt: new Date(Date.now() - 18 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p120', title: 'Simulated Product 20', category: 'Home Goods', price: 30.00, commission: 6, createdAt: new Date(Date.now() - 19 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p121', title: 'Simulated Product 21', category: 'Electronics', price: 150.00, commission: 18, createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p122', title: 'Simulated Product 22', category: 'Books', price: 28.00, commission: 9, createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p123', title: 'Simulated Product 23', category: 'Apparel', price: 90.00, commission: 15, createdAt: new Date(Date.now() - 22 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p124', title: 'Simulated Product 24', category: 'Home Goods', price: 60.00, commission: 12, createdAt: new Date(Date.now() - 23 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p125', title: 'Simulated Product 25', category: 'Electronics', price: 75.00, commission: 10, createdAt: new Date(Date.now() - 24 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p126', title: 'Simulated Product 26', category: 'Books', price: 19.00, commission: 7, createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p127', title: 'Simulated Product 27', category: 'Apparel', price: 110.00, commission: 16, createdAt: new Date(Date.now() - 26 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p128', title: 'Simulated Product 28', category: 'Home Goods', price: 40.00, commission: 8, createdAt: new Date(Date.now() - 27 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p129', title: 'Simulated Product 29', category: 'Electronics', price: 130.00, commission: 17, createdAt: new Date(Date.now() - 28 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p130', title: 'Simulated Product 30', category: 'Books', price: 25.00, commission: 8, createdAt: new Date(Date.now() - 29 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p131', title: 'Simulated Product 31', category: 'Apparel', price: 75.00, commission: 13, createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p132', title: 'Simulated Product 32', category: 'Home Goods', price: 55.00, commission: 11, createdAt: new Date(Date.now() - 31 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p133', title: 'Simulated Product 33', category: 'Electronics', price: 99.00, commission: 14, createdAt: new Date(Date.now() - 32 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p134', title: 'Simulated Product 34', category: 'Books', price: 16.00, commission: 5, createdAt: new Date(Date.now() - 33 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p135', title: 'Simulated Product 35', category: 'Apparel', price: 100.00, commission: 15, createdAt: new Date(Date.now() - 34 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p136', title: 'Simulated Product 36', category: 'Home Goods', price: 48.00, commission: 10, createdAt: new Date(Date.now() - 35 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p137', title: 'Simulated Product 37', category: 'Electronics', price: 88.00, commission: 12, createdAt: new Date(Date.now() - 36 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p138', title: 'Simulated Product 38', category: 'Books', price: 21.00, commission: 7, createdAt: new Date(Date.now() - 37 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p139', title: 'Simulated Product 39', category: 'Apparel', price: 65.00, commission: 11, createdAt: new Date(Date.now() - 38 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p140', title: 'Simulated Product 40', category: 'Home Goods', price: 33.00, commission: 9, createdAt: new Date(Date.now() - 39 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p141', title: 'Simulated Product 41', category: 'Electronics', price: 115.00, commission: 16, createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p142', title: 'Simulated Product 42', category: 'Books', price: 14.00, commission: 5, createdAt: new Date(Date.now() - 41 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p143', title: 'Simulated Product 43', category: 'Apparel', price: 95.00, commission: 14, createdAt: new Date(Date.now() - 42 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p144', title: 'Simulated Product 44', category: 'Home Goods', price: 70.00, commission: 13, createdAt: new Date(Date.now() - 43 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p145', title: 'Simulated Product 45', category: 'Electronics', price: 105.00, commission: 15, createdAt: new Date(Date.now() - 44 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p146', title: 'Simulated Product 46', category: 'Books', price: 23.00, commission: 7, createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p147', title: 'Simulated Product 47', category: 'Apparel', price: 80.00, commission: 12, createdAt: new Date(Date.now() - 46 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p148', title: 'Simulated Product 48', category: 'Home Goods', price: 38.00, commission: 9, createdAt: new Date(Date.now() - 47 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p149', title: 'Simulated Product 49', category: 'Electronics', price: 140.00, commission: 19, createdAt: new Date(Date.now() - 48 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p150', title: 'Simulated Product 50', category: 'Books', price: 20.00, commission: 6, createdAt: new Date(Date.now() - 49 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p151', title: 'Simulated Product 51', category: 'Apparel', price: 50.00, commission: 10, createdAt: new Date(Date.now() - 50 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p152', title: 'Simulated Product 52', category: 'Home Goods', price: 65.00, commission: 12, createdAt: new Date(Date.now() - 51 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p153', title: 'Simulated Product 53', category: 'Electronics', price: 92.00, commission: 13, createdAt: new Date(Date.now() - 52 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p154', title: 'Simulated Product 54', category: 'Books', price: 17.00, commission: 6, createdAt: new Date(Date.now() - 53 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p155', title: 'Simulated Product 55', category: 'Apparel', price: 120.00, commission: 17, createdAt: new Date(Date.now() - 54 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p156', title: 'Simulated Product 56', category: 'Home Goods', price: 42.00, commission: 9, createdAt: new Date(Date.now() - 55 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p157', title: 'Simulated Product 57', category: 'Electronics', price: 110.00, commission: 16, createdAt: new Date(Date.now() - 56 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p158', title: 'Simulated Product 58', category: 'Books', price: 26.00, commission: 8, createdAt: new Date(Date.now() - 57 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p159', title: 'Simulated Product 59', category: 'Apparel', price: 70.00, commission: 11, createdAt: new Date(Date.now() - 58 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p160', title: 'Simulated Product 60', category: 'Home Goods', price: 35.00, commission: 7, createdAt: new Date(Date.now() - 59 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p161', title: 'Simulated Product 61', category: 'Electronics', price: 125.00, commission: 17, createdAt: new Date(Date.now() - 60 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p162', title: 'Simulated Product 62', category: 'Books', price: 13.00, commission: 4, createdAt: new Date(Date.now() - 61 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p163', title: 'Simulated Product 63', category: 'Apparel', price: 88.00, commission: 13, createdAt: new Date(Date.now() - 62 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p164', title: 'Simulated Product 64', category: 'Home Goods', price: 52.00, commission: 10, createdAt: new Date(Date.now() - 63 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p165', title: 'Simulated Product 65', category: 'Electronics', price: 98.00, commission: 14, createdAt: new Date(Date.now() - 64 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p166', title: 'Simulated Product 66', category: 'Books', price: 24.00, commission: 7, createdAt: new Date(Date.now() - 65 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p167', title: 'Simulated Product 67', category: 'Apparel', price: 78.00, commission: 12, createdAt: new Date(Date.now() - 66 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p168', title: 'Simulated Product 68', category: 'Home Goods', price: 40.00, commission: 8, createdAt: new Date(Date.now() - 67 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p169', title: 'Simulated Product 69', category: 'Electronics', price: 135.00, commission: 18, createdAt: new Date(Date.now() - 68 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p170', title: 'Simulated Product 70', category: 'Books', price: 29.00, commission: 9, createdAt: new Date(Date.now() - 69 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p171', title: 'Simulated Product 71', category: 'Apparel', price: 105.00, commission: 16, createdAt: new Date(Date.now() - 70 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p172', title: 'Simulated Product 72', category: 'Home Goods', price: 62.00, commission: 11, createdAt: new Date(Date.now() - 71 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p173', title: 'Simulated Product 73', category: 'Electronics', price: 70.00, commission: 9, createdAt: new Date(Date.now() - 72 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p174', title: 'Simulated Product 74', category: 'Books', price: 15.00, commission: 5, createdAt: new Date(Date.now() - 73 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p175', title: 'Simulated Product 75', category: 'Apparel', price: 99.00, commission: 15, createdAt: new Date(Date.now() - 74 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p176', title: 'Simulated Product 76', category: 'Home Goods', price: 44.00, commission: 9, createdAt: new Date(Date.now() - 75 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p177', title: 'Simulated Product 77', category: 'Electronics', price: 108.00, commission: 14, createdAt: new Date(Date.now() - 76 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p178', title: 'Simulated Product 78', category: 'Books', price: 22.00, commission: 7, createdAt: new Date(Date.now() - 77 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p179', title: 'Simulated Product 79', category: 'Apparel', price: 82.00, commission: 13, createdAt: new Date(Date.now() - 78 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p180', title: 'Simulated Product 80', category: 'Home Goods', price: 37.00, commission: 8, createdAt: new Date(Date.now() - 79 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p181', title: 'Simulated Product 81', category: 'Electronics', price: 145.00, commission: 19, createdAt: new Date(Date.now() - 80 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p182', title: 'Simulated Product 82', category: 'Books', price: 18.00, commission: 6, createdAt: new Date(Date.now() - 81 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p183', title: 'Simulated Product 83', category: 'Apparel', price: 55.00, commission: 10, createdAt: new Date(Date.now() - 82 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p184', title: 'Simulated Product 84', category: 'Home Goods', price: 68.00, commission: 12, createdAt: new Date(Date.now() - 83 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p185', title: 'Simulated Product 85', category: 'Electronics', price: 95.00, commission: 13, createdAt: new Date(Date.now() - 84 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p186', title: 'Simulated Product 86', category: 'Books', price: 16.00, commission: 5, createdAt: new Date(Date.now() - 85 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p187', title: 'Simulated Product 87', category: 'Apparel', price: 115.00, commission: 17, createdAt: new Date(Date.now() - 86 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p188', title: 'Simulated Product 88', category: 'Home Goods', price: 46.00, commission: 9, createdAt: new Date(Date.now() - 87 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p189', title: 'Simulated Product 89', category: 'Electronics', price: 100.00, commission: 15, createdAt: new Date(Date.now() - 88 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p190', title: 'Simulated Product 90', category: 'Books', price: 27.00, commission: 8, createdAt: new Date(Date.now() - 89 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p191', title: 'Simulated Product 91', category: 'Apparel', price: 72.00, commission: 11, createdAt: new Date(Date.now() - 90 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p192', title: 'Simulated Product 92', category: 'Home Goods', price: 39.00, commission: 8, createdAt: new Date(Date.now() - 91 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p193', title: 'Simulated Product 93', category: 'Electronics', price: 130.00, commission: 17, createdAt: new Date(Date.now() - 92 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p194', title: 'Simulated Product 94', category: 'Books', price: 19.00, commission: 6, createdAt: new Date(Date.now() - 93 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p195', title: 'Simulated Product 95', category: 'Apparel', price: 85.00, commission: 14, createdAt: new Date(Date.now() - 94 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p196', title: 'Simulated Product 96', category: 'Home Goods', price: 50.00, commission: 10, createdAt: new Date(Date.now() - 95 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p197', title: 'Simulated Product 97', category: 'Electronics', price: 112.00, commission: 16, createdAt: new Date(Date.now() - 96 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p198', title: 'Simulated Product 98', category: 'Books', price: 20.00, commission: 7, createdAt: new Date(Date.now() - 97 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p199', title: 'Simulated Product 99', category: 'Apparel', price: 93.00, commission: 15, createdAt: new Date(Date.now() - 98 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p200', title: 'Simulated Product 100', category: 'Home Goods', price: 41.00, commission: 9, createdAt: new Date(Date.now() - 99 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p201', title: 'Simulated Product 101', category: 'Electronics', price: 128.00, commission: 18, createdAt: new Date(Date.now() - 100 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p202', title: 'Simulated Product 102', category: 'Books', price: 24.00, commission: 8, createdAt: new Date(Date.now() - 101 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p203', title: 'Simulated Product 103', category: 'Apparel', price: 78.00, commission: 12, createdAt: new Date(Date.now() - 102 * 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
      ];

      setTimeout(() => {
        setMessage('Products imported successfully! (Simulated)');
        setImportedData(simulatedProducts);
        // In a real app, you'd update the main product list here after successful backend import
        // setProducts(prevProducts => replaceMode ? simulatedProducts : [...prevProducts, ...simulatedProducts]);
      }, 1500);

    } catch (error) {
      console.error("Import error:", error);
      setMessage(`Import failed: ${error.message}. Please ensure the URL is correct and the sheet is publicly accessible or your backend handles authentication.`);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-semibold text-white mb-6">Admin Product Manager</h2>

      <div className="bg-white/5 p-4 rounded-lg shadow-inner mb-6 border border-white/10">
        <p className="text-white/70 mb-4">
          Enter the Google Sheet URL containing product data. In a real application, this URL would be sent to a backend
          for secure fetching, parsing, and storage of products into your database.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Google Sheet URL (e.g., https://docs.google.com/spreadsheets/d/...)"
            value={googleSheetUrl}
            onChange={(e) => setGoogleSheetUrl(e.target.value)}
            className="flex-grow p-2.5 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={handleImport}
            className="px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
            disabled={!googleSheetUrl}
          >
            {message === 'Importing...' ? 'Importing…' : 'Import Products'}
          </button>
        </div>
        {message && <p className="mt-4 text-white/80">{message}</p>}
      </div>

      {importedData && importedData.length > 0 && (
        <div className="bg-white/5 p-4 rounded-lg shadow-inner border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Simulated Imported Products:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importedData.map(product => (
              <div key={product.id} className="bg-white/10 p-3 rounded-lg border border-white/20">
                <h4 className="font-semibold text-white">{product.title}</h4>
                <p className="text-sm text-white/70">Category: {product.category}</p>
                <p className="text-sm text-white/70">Price: ${product.price}</p>
                <p className="text-sm text-white/70">Commission: {product.commission}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default AdminProductManager;