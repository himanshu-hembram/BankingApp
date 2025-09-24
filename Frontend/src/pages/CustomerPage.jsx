import { useState, useContext } from 'react';
import AddUpdateCustomer from './AddUpdateCustomer';
import CustomerDisplayForm from './CustomerDisplayForm';
import CustomerContext from '../context/CustomerContext'; // Import the context

export default function CustomerPage() {
  // Get everything from the context
  const {
    isDialogOpen,
    currentCustomer,
    searchedCustomer,
    openDialog,
    closeDialog,
    saveCustomer,
    deleteCustomer,
    searchCustomer,
  } = useContext(CustomerContext);

  const [searchId, setSearchId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    searchCustomer(searchId);
  };

  return (
    
    <div className="flex flex-col min-h-screen bg-gray-50">
  {/* Header */}
  <h1 className="text-2xl font-bold text-center py-6">Customer Information</h1>

  <div className="flex-grow max-w-6xl w-full mx-auto px-4">
    {/* Top Search Section */}
    <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSearch} className="flex items-center gap-4">
        {/* Label + Input inline */}
        <label htmlFor="customerId" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Customer ID:
        </label>
        <input
          type="text"
          id="customerId"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter Customer ID"
        />
        <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Search
        </button>
        <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Advanced Search
        </button>
      </form>
    </div>

    {/* Main Content: Two-Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Customer Information */}
      <div className="lg:col-span-2">
        <CustomerDisplayForm customer={searchedCustomer} />
      </div>

      {/* Right Column: Actions */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2">Actions</h3>
        <div className="space-y-4">
          <button
            onClick={() => openDialog(null)}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Add Customer
          </button>
          <button
            onClick={() => openDialog(searchedCustomer)}
            disabled={!searchedCustomer}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Update Customer
          </button>
          <button
            onClick={deleteCustomer}
            disabled={!searchedCustomer}
            className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Delete Customer
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Dialog for Add/Update */}
  {isDialogOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
        <AddUpdateCustomer
          onSave={saveCustomer}
          onClose={closeDialog}
          initialData={currentCustomer}
        />
      </div>
    </div>
  )}
</div>

    
  );
}