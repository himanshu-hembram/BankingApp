import { createContext, useState, useMemo, useCallback } from "react";

const CustomerContext = createContext();

const API_BASE = "http://localhost:8000/customers";

export const CustomerProvider = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchedCustomer, setSearchedCustomer] = useState(null);

  const openDialog = useCallback((customerData = null) => {
    setCurrentCustomer(customerData);
    setIsUpdateMode(Boolean(customerData));
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentCustomer(null);
  }, []);

  const searchCustomer = useCallback(async (customerId) => {
    if (!customerId) return;
    console.log(`Searching for customer with ID: ${customerId}`);

    try {
      const token = localStorage.getItem("authToken"); // 🔑 get token from storage
      if (!token) {
        throw new Error("No auth token found — please login again.");
      }

      const response = await fetch(
        `${API_BASE}/${encodeURIComponent(customerId.trim())}`, // ✅ match backend route
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach Bearer token
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized — token may be expired. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Customer not found.");
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      setSearchedCustomer(data); // ✅ update state with customer
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      setSearchedCustomer(null); // Clear previous results on error
      alert(error.message);
    }
  }, []);


  const saveCustomer = useCallback(
    async (formData) => {
      
      const url = isUpdateMode ? `${API_BASE}/${formData.id}` : API_BASE;
      const method = isUpdateMode ? "PUT" : "POST";

      try {
        const token = localStorage.getItem("authToken"); // 🔑 get token from storage
        if (!token) {
          throw new Error("No auth token found — please login again.");
        }

        console.log("Sending data to:", url);
        console.log("Method:", method);
        console.log("Payload:", JSON.stringify(formData));

        const response = await fetch(url, {
          method,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ attach Bearer token
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to save customer. Status: ${response.status}`);
        }

        const savedData = await response.json();
        setSearchedCustomer(savedData);
        alert("Customer saved successfully!");
        closeDialog();
      } catch (error) {
        console.error("Failed to save customer:", error);
        alert(error.message);
      }
    },
    [closeDialog]
  );

  const deleteCustomer = useCallback(async () => {
    if (!searchedCustomer) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${searchedCustomer.firstName}?`
      )
    ) {
      try {
        const response = await fetch(`${API_BASE}/${searchedCustomer.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to delete customer. Status: ${response.status}`
          );
        }

        alert("Customer deleted successfully!");
        setSearchedCustomer(null); // Clear display after deletion
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert(error.message);
      }
    }
  }, [searchedCustomer]);

  const value = useMemo(
    () => ({
      isDialogOpen,
      currentCustomer,
      searchedCustomer,
      openDialog,
      closeDialog,
      saveCustomer,
      deleteCustomer,
      searchCustomer,
    }),
    [
      isDialogOpen,
      currentCustomer,
      searchedCustomer,
      openDialog,
      closeDialog,
      saveCustomer,
      deleteCustomer,
      searchCustomer,
    ]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerContext;
