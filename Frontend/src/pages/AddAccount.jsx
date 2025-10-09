// src/pages/AddAccount.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerContext from "../context/CustomerContext";
import AdvanceSearch from "../components/AdvanceSearch";

const AddAccount = () => {
  const [accountType, setAccountType] = useState("savings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAdvOpen, setAdvOpen] = useState(false);

  const {addAccount, searchedCustomer, searchCustomer } = useContext(CustomerContext);
  const navigate = useNavigate();

  // Optional: restore last selected customer on mount
  useEffect(() => {
    const lastId = localStorage.getItem("selectedCustId");
    if (!searchedCustomer && lastId) {
      searchCustomer?.(lastId);
    }
  }, [searchedCustomer, searchCustomer]);

  const isLocked = !searchedCustomer;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      alert("Please select a customer before creating an account.");
      return;
    }
    setIsSubmitting(true);

    const formData = Object.fromEntries(new FormData(e.target).entries());
    console.log("Form Data Submitted:", formData);

    try {
      const result = await addAccount(accountType, formData);
      if (result) {
        // show success inline, reset form and auto-hide message
        setSuccessMessage("Account created successfully!");
        e.target.reset();
        // optionally clear selected customer UI (context already clears selectedCustId)
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // Helper fields (support multiple casings)
  const custId = searchedCustomer?.CustID ?? searchedCustomer?.custId ?? searchedCustomer?.id;
  const firstName = searchedCustomer?.firstName ?? searchedCustomer?.FirstName ?? "";
  const lastName = searchedCustomer?.lastName ?? searchedCustomer?.LastName ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success banner */}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 shadow-sm">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            {isLocked ? "Add Bank Account" : `Adding Account for ${displayName || "Customer"}`}
          </h1>
          <p className="text-slate-600 mt-2">
            {isLocked
              ? "Step 1: Search and select a customer to proceed."
              : `Customer ID: ${custId ?? "—"}`}
          </p>

          {/* Search CTA */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setAdvOpen(true)}
              className={`h-9 px-4 rounded border ${
                isLocked
                  ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isLocked ? "Search Customer to Add Account" : "Change Selected Customer"}
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-2xl font-semibold text-white">Account Information</h2>
            <p className="text-indigo-100 mt-1">
              {accountType === "savings" ? "Savings Account Details" : "Loan Account Details"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Account Type Selection */}
            <div className="border-b border-gray-200 pb-6">
              <label className="block text-lg font-medium text-slate-700 mb-4">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full max-w-xs rounded-lg border px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-100 disabled:text-slate-400"
                required
                disabled={isLocked}
              >
                <option value="savings">Savings Account</option>
                <option value="loans">Loan Account</option>
              </select>
              {isLocked && (
                <p className="text-xs text-slate-500 mt-2">Select a customer to enable account setup.</p>
              )}
            </div>

            {/* Conditional Fields */}
            {accountType === "savings" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Sub Type" name="accSubType" required disabled={isLocked} />
                <Input label="Balance" name="balance" type="number" disabled={isLocked} />
                <Input label="Transfer Limit" name="transferLimit" type="number" disabled={isLocked} />
                <Input label="Branch Code" name="branchCode" required disabled={isLocked} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Sub Type" required name="accSubType" type="text" disabled={isLocked} />
                <Input label="Loan Amount" name="totalLoanAmount" type="number" disabled={isLocked} />
                {/* <Input label="Balance Amount" name="balanceAmount" type="number" disabled={isLocked} /> */}
                <Input label="Rate of Interest (%)" name="rateOfInterest" type="decimal" disabled={isLocked} />
                <Input label="Loan Duration (months)" name="loanDuration" disabled={isLocked} />
                <Input label="Branch Code" name="branchCode" required disabled={isLocked} />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              {/* Success banner */}
              {successMessage && (
                <div className="mb-6 rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 shadow-sm">
                  {successMessage}
                </div>
              )}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-white text-slate-700 border hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLocked || isSubmitting}
                className="px-8 py-3 rounded-lg bg-indigo-500 text-white font-semibold shadow-md hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
                aria-disabled={isLocked || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Advance Search Modal */}
      <AdvanceSearch
        isOpen={isAdvOpen}
        onClose={() => setAdvOpen(false)}
        onAfterSelect={() => setAdvOpen(false)}
      />
    </div>
  );
};

/* Input Component */
const Input = ({ label, name, type = "text", required = false, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      disabled={disabled}
      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-100 disabled:text-slate-400"
      placeholder={`Enter ${label}`}
    />
  </div>
);

export default AddAccount;
