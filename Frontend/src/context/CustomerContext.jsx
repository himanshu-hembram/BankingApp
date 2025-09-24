import { createContext, useState, useMemo, useCallback, useEffect } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchedCustomer, setSearchedCustomer] = useState(null);

  const openDialog = useCallback((customerData = null) => {
    setCurrentCustomer(customerData);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentCustomer(null);
  }, []);

  const searchCustomer = async (customerId) => {
  if (!customerId) return;
  console.log(`Searching for customer with ID: ${customerId}`);
  try {
    const response = await fetch(
      `http://localhost:8000/api/customers/${encodeURIComponent(customerId.trim())}`,
  { method: 'GET', headers: { 'Accept': 'application/json' } }
    
    );
    if (!response.ok) {
      throw new Error(`Customer not found. Status: ${response.status}`);
    }
    const data = await response.json();
    setSearchedCustomer(data);
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    setSearchedCustomer(null); // Clear previous results on error
    alert(error.message);
  }
};



  const saveCustomer = useCallback(async (formData) => {
    const isUpdate = !!formData.id;
    const url = isUpdate ? `/api/customers/${formData.id}` : '/api/customers';
    const method = isUpdate ? 'PUT' : 'POST';

    // try {
      // ✅ Log what data is being sent and where
      console.log("Sending data to:", url);
      console.log("Method:", method);
      console.log("Payload:", JSON.stringify(formData));

      // const response = await fetch(url, {
      //   method: method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error(`Failed to save customer. Status: ${response.status}`);
      // }

      // const savedData = await response.json();
      
      // Update the main display with the newly saved data
    //   setSearchedCustomer(savedData);
    //   alert('Customer saved successfully!');
    //   closeDialog();

    // } catch (error) {
    //   console.error("Failed to save customer:", error);
    //   alert(error.message);
    // }
  }, [closeDialog]);


  const deleteCustomer = useCallback(async () => {
    if (!searchedCustomer) return;
    if (window.confirm(`Are you sure you want to delete ${searchedCustomer.firstName}?`)) {
      try {
        const response = await fetch(`/api/customers/${searchedCustomer.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete customer. Status: ${response.status}`);
        }

        alert('Customer deleted successfully!');
        setSearchedCustomer(null); // Clear display after deletion
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert(error.message);
      }
    }
  }, [searchedCustomer]);

  const value = useMemo(() => ({
    isDialogOpen,
    currentCustomer,
    searchedCustomer,
    openDialog,
    closeDialog,
    saveCustomer,
    deleteCustomer,
    searchCustomer,
  }), [isDialogOpen, currentCustomer, searchedCustomer, openDialog, closeDialog, saveCustomer, deleteCustomer, searchCustomer]);

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerContext;