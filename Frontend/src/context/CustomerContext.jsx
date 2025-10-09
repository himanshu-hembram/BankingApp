import { createContext, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../lib/api"; // use the centralized token helper

const CustomerContext = createContext();

const API_BASE = "http://localhost:8000/customers";

export const CustomerProvider = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [searchedCustomer, setSearchedCustomer] = useState(null);
  const navigate = useNavigate();
  

  // const openDialog = useCallback((customerData = null) => {
  //   setCurrentCustomer(customerData);
  //   console.log("Opening dialog for customer:", customerData);
  //   setIsUpdateMode(Boolean(customerData));
  //   console.log("isUpdateMode set to:", Boolean(customerData));
  //   setIsDialogOpen(true);
  // }, []);

  const openDialog = useCallback(
  (customerData = null) => {
    setCurrentCustomer(customerData);
    const isUpdate = Boolean(customerData);
    setIsUpdateMode(isUpdate);

    // Persist selected customer id for downstream pages (optional but useful)
    if (customerData) {
      const cid =
        customerData.CustID ??
        customerData.custId ??
        customerData.id ??
        "";
      if (cid) localStorage.setItem("selectedCustId", String(cid));
    }

    // We're navigating to a dedicated page, so no dialog here
    setIsDialogOpen(false);

    // Navigate to the Update Customer route (change path if your route differs)
    navigate("/update-customer");
  },
  [navigate]
);


  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentCustomer(null);
  }, []);

  const searchCustomer = useCallback(async (customerId) => {
    if (!customerId) return;
    console.log(`Searching for customer with ID: ${customerId}`);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found — please login again.");

      const idStr = String(customerId).trim();
      const response = await fetch(`${API_BASE}/${encodeURIComponent(idStr)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error(
            "Unauthorized — token may be expired. Please log in again."
          );
        else if (response.status === 404)
          throw new Error("Customer not found.");
        else throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSearchedCustomer(data);
      console.log("Customer found:", data);

      // ✅ Save customer ID separately
      localStorage.setItem("selectedCustId", data.CustID);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      setSearchedCustomer(null);
      alert(error.message);
    }
  }, []);

  const advanceSearchCustomers = useCallback(async (filters) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found — please login again.");

      const response = await fetch(`${API_BASE}/advSearch`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filters),
      });

      console.log(response);
      if (!response.ok) {
        if (response.status === 400)
          throw new Error("At least one filter is required");
        else throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
       // clear any selected customer
      console.log("Advance search results:", data);
      return data; // return array of customers
    } catch (error) {
      console.error("Advance search failed:", error);
      alert(error.message);
      return [];
    }
  }, []);

  const saveCustomer = useCallback(
    async (formData) => {
      const customerId = localStorage.getItem("selectedCustId");

      const url = isUpdateMode
        ? `${API_BASE}/${encodeURIComponent(customerId.trim())}`
        : API_BASE;
      const method = isUpdateMode ? "PUT" : "POST";

      try {
        const token = getAuthToken();
        if (!token)
          throw new Error("No auth token found — please login again.");

        console.log("Sending data to:", url);
        console.log("Method:", method);
        console.log("Payload:", JSON.stringify(formData));
        setSearchedCustomer(formData);

        const response = await fetch(url, {
          method,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to save customer. Status: ${response.status}`
          );
        }

        // const savedData = await response.json();
        // console.log("Customer saved:", savedData);
        // setSearchedCustomer(savedData);
        alert("Customer saved successfully!");
        closeDialog();
        navigate("/customer"); // Redirect to /customer page after saving
      } catch (error) {
        console.error("Failed to save customer:", error);
        alert(error.message);
      }
    },
    [isUpdateMode, closeDialog, navigate] // ✅ add isUpdateMode dependency
  );

  const deleteCustomer = useCallback(async () => {
    if (!searchedCustomer) return;
    console.log("Deleting customer:", searchedCustomer);
    if (
      window.confirm(
        `Are you sure you want to delete ${searchedCustomer.FirstName}?`
      )
    ) {
      try {
        const token = getAuthToken();
        if (!token)
          throw new Error("No auth token found — please login again.");

        const response = await fetch(
          `${API_BASE}/${encodeURIComponent(searchedCustomer.CustID)}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  function buildAccountPayload(accountType, formData) {
    if (accountType === "loan") {
      return {
        // Server expects PascalCase based on your curl
        AccountType: "loan",
        AccSubType: formData.accSubType ?? "",
        TotalLoanAmount: formData.totalLoanAmount
          ? Number(formData.totalLoanAmount)
          : 0,
        RateOfInterest: formData.rateOfInterest
          ? Number(formData.rateOfInterest)
          : 0,
          BalanceAmount:0,
        LoanDuration: formData.loanDuration ?? "",
        BranchCode: formData.branchCode ?? "",
      };
    }
    // default: savings
    return {
      AccountType: "savings", // fallback (can map from a form field if needed)
      AccSubType: formData.accSubType ?? "",
      Balance: formData.balance ? Number(formData.balance) : 0,
      TransferLimit: formData.transferLimit
        ? Number(formData.transferLimit)
        : 0,
      BranchCode: formData.branchCode ?? "",
    };
  }
  const addAccount = useCallback(
    async (accountType, formData) => {
      const token = getAuthToken();
      if (!token) throw new Error("No auth token found — please login again.");

      // Resolve customer id from localStorage first (as set by searchCustomer)
      const storedId = localStorage.getItem("selectedCustId");
      const ctxId =
        searchedCustomer?.CustID ??
        searchedCustomer?.custId ??
        searchedCustomer?.id;
      const customerId = String(ctxId ?? storedId ?? "").trim();

      if (!customerId)
        throw new Error("No customer selected. Please pick a customer first.");

      // Path segment must match API: 'savings' or 'loans'
      const pathType = accountType === "loans" ? "loan" : "savings";
      const url = `${API_BASE}/${encodeURIComponent(
        customerId
      )}/${encodeURIComponent(pathType)}`;

      const payload = buildAccountPayload(pathType, formData);
      console.log("Creating account with payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Clear selected customer id from localStorage after successful account creation

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthorized — token may be expired. Please log in again."
          );
        } else if (response.status === 404) {
          throw new Error("Customer not found.");
        } else {
          throw new Error(
            `Failed to create account. Status: ${response.status}`
          );
        }
      }
      localStorage.removeItem("selectedCustId");
      setSearchedCustomer(null);

      const created = await response.json();

      // Merge into context so UI updates immediately
      setSearchedCustomer((prev) => {
        if (!prev) return prev;
        const existing =
          prev.accounts ?? prev.Accounts ?? prev.accountList ?? [];
        return {
          ...prev,
          accounts: Array.isArray(existing)
            ? [...existing, created]
            : [created],
        };
      });

      return created; // caller can navigate on truthy result
    },
    [searchedCustomer]
  );


  const makeDeposit = useCallback(async (formData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found — please login again.");

    // Resolve customer ID from localStorage or searchedCustomer
    const storedId = localStorage.getItem("selectedCustId");
    const ctxId =
      searchedCustomer?.CustID ??
      searchedCustomer?.custId ??
      searchedCustomer?.id;
    const customerId = String(ctxId ?? storedId ?? "").trim();
    if (!customerId)
      throw new Error("No customer selected. Please select a customer first.");

    // Endpoint: POST /customers/{id}/savings/deposit
    const url = `${API_BASE}/${encodeURIComponent(
      customerId
    )}/savings/deposit`;

    const payload = {
      AcctNum: formData.acctNum ? Number(formData.acctNum) : 0,
      Amount: formData.amount ? Number(formData.amount) : 0,
      TxnDate: new Date().toISOString(),
      TxnDetail: formData.txnDetail || "Deposit",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Deposit failed — Status: ${response.status}`);
    }

    const data = await response.json();
    alert("Deposit successful!");
    console.log("Deposit response:", data);
    searchCustomer(customerId); // Refresh customer data to reflect new balance
    navigate("/dashboard"); // Redirect to dashboard after deposit

    // Optionally update customer or transaction list in context
    setSearchedCustomer((prev) =>
      prev ? { ...prev, lastTransaction: data } : prev
    );

    return data;
  } catch (error) {
    console.error("Deposit error:", error);
    alert(error.message);
    return null;
  }
}, [searchedCustomer]);

const makeWithdrawal = useCallback(async (formData) => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token found — please login again.");

    const storedId = localStorage.getItem("selectedCustId");
    const ctxId =
      searchedCustomer?.CustID ??
      searchedCustomer?.custId ??
      searchedCustomer?.id;
    const customerId = String(storedId ?? ctxId ?? "").trim();
    if (!customerId)
      throw new Error("No customer selected. Please select a customer first.");

    const url = `${API_BASE}/${encodeURIComponent(
      customerId
    )}/savings/withdraw`;

    const payload = {
      AcctNum: formData.acctNum ? Number(formData.acctNum) : 0,
      Amount: formData.amount ? Number(formData.amount) : 0,
      TxnDate: new Date().toISOString(),
      TxnDetail: formData.txnDetail || "Withdrawal",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Withdrawal failed — Status: ${response.status}`);
    }

    const data = await response.json();
    alert("Withdrawal successful!");
    console.log("Withdrawal response:", data);
    searchCustomer(customerId); // Refresh customer data to reflect new balance
    navigate("/dashboard"); // Redirect to dashboard after deposit


    setSearchedCustomer((prev) =>
      prev ? { ...prev, lastTransaction: data } : prev
    );

    return data;
  } catch (error) {
    console.error("Withdrawal error:", error);
    alert(error.message);
    return null;
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
      advanceSearchCustomers,
      addAccount,
      makeDeposit,
      makeWithdrawal,
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
      advanceSearchCustomers,
      addAccount,
      makeDeposit,
      makeWithdrawal,
    ]
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerContext;
