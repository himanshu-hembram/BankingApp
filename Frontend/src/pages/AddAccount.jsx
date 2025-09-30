import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CustomerContext from "../context/CustomerContext";

const AddAccount = () => {
  const [accountType, setAccountType] = useState("savings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAccount } = useContext(CustomerContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = Object.fromEntries(new FormData(e.target).entries());

    try {
      const result = await addAccount(accountType, formData);
      if (result) {
        navigate("/account", {
          state: { message: "Account created successfully!" },
        });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Accounts
          </button> */}
          <h1 className="text-3xl font-bold text-slate-800">Add Bank Account</h1>
          <p className="text-slate-600 mt-2">
            Create a new bank account for your profile
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-2xl font-semibold text-white">
              Account Information
            </h2>
            <p className="text-indigo-100 mt-1">
              {accountType === "savings"
                ? "Savings Account Details"
                : "Loan Account Details"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Account Type Selection */}
            <div className="border-b border-gray-200 pb-6">
              <label className="block text-lg font-medium text-slate-700 mb-4">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full max-w-xs rounded-lg border px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
              >
                <option value="savings">Savings Account</option>
                <option value="loans">Loan Account</option>
              </select>
            </div>

            {/* Conditional Fields */}
            {accountType === "savings" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Sub Type" name="accSubType" required />
                <Input label="Balance" name="balance" type="number" />
                <Input
                  label="Transfer Limit"
                  name="transferLimit"
                  type="number"
                />
                <Input label="Branch Code" name="branchCode" required />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Loan Amount" name="totalLoanAmount" type="number" />
                <Input
                  label="Rate of Interest (%)"
                  name="rateOfInterest"
                  type="number"
                />
                <Input label="Loan Duration (months)" name="loanDuration" />
                <Input label="Branch Code" name="branchCode" required />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-white text-slate-700 border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-indigo-500 text-white font-semibold shadow-md hover:scale-[1.02] transition"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* Input Component */
const Input = ({ label, name, type = "text", required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-300"
      placeholder={`Enter ${label}`}
    />
  </div>
);

export default AddAccount;
