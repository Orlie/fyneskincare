import React, { useState } from 'react';

function AdminProductManager() {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [importedData, setImportedData] = useState(null);

  const handleImport = async () => {
    setMessage('Importing...');
    setImportedData(null);

    // --- Placeholder for actual Google Sheet fetching and parsing logic ---
    // In a real application, you would:
    // 1. Send this URL to a backend server.
    // 2. The backend server would fetch the Google Sheet data (handling CORS and authentication).
    // 3. Parse the data (e.g., CSV, JSON).
    // 4. Validate the data.
    // 5. Store the products in your database.
    // 6. Return a success or failure message.

    // Simulating a successful import after a delay
    try {
      // Example: Fetching a public CSV from Google Sheets (requires proper sharing settings)
      // const response = await fetch(`${googleSheetUrl.replace('/edit#gid=', '/export?format=csv&gid=')}`);
      // const text = await response.text();
      // console.log("Fetched CSV:", text);
      // Parse CSV here and set importedData

      // For demonstration, just simulate some data
      const simulatedProducts = [
        { id: 'p101', title: 'Simulated Product 1', category: 'Electronics', price: 29.99, commission: 10, createdAt: new Date().toISOString(), image: 'https://via.placeholder.com/150' },
        { id: 'p102', title: 'Simulated Product 2', category: 'Books', price: 15.00, commission: 5, createdAt: new Date(Date.now() - 86400000).toISOString(), image: 'https://via.placeholder.com/150' },
      ];

      setTimeout(() => {
        setMessage('Products imported successfully! (Simulated)');
        setImportedData(simulatedProducts);
      }, 1500);

    } catch (error) {
      console.error("Import error:", error);
      setMessage(`Import failed: ${error.message}. Please ensure the URL is correct and the sheet is publicly accessible or your backend handles authentication.`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Admin Product Manager</h2>

      <div className="bg-white/5 p-4 rounded-lg shadow-inner mb-6">
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
            className="flex-grow p-2 rounded-md bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleImport}
            className="px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            disabled={!googleSheetUrl}
          >
            Import Products
          </button>
        </div>
        {message && <p className="mt-4 text-white/80">{message}</p>}
      </div>

      {importedData && importedData.length > 0 && (
        <div className="bg-white/5 p-4 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-white mb-4">Simulated Imported Products:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {importedData.map(product => (
              <div key={product.id} className="bg-white/10 p-3 rounded-md">
                <h4 className="font-semibold text-white">{product.title}</h4>
                <p className="text-sm text-white/70">Category: {product.category}</p>
                <p className="text-sm text-white/70">Price: ${product.price}</p>
                <p className="text-sm text-white/70">Commission: {product.commission}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductManager;
