import React, { useState } from "react";

const AddAccountModal = ({ isOpen, onClose, onSubmit }) => {
  const [accountType, setAccountType] = useState("SavingAccountDetail");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const payload = { accountType, ...data };

    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar { width: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 9999px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(148,163,184,0.9), rgba(100,116,139,0.9));
      border-radius: 9999px;
      border: 2px solid rgba(255,255,255,0.6);
      box-shadow: 0 2px 6px rgba(2,6,23,0.2);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(100,116,139,1), rgba(79,70,229,0.95));
    }
    /* Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(100,116,139,0.9) transparent;
    }
  `;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
          {/* White card */}
          <div className="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-indigo-600 border-b border-indigo-600">
              <h2 className="text-xl font-semibold text-white">
                Add Bank Account
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable form area */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto custom-scrollbar"
            >
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <select
                    name="accountType"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-2/4 appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  >
                    <option value="SavingAccountDetail">Savings Account</option>
                    <option value="LoanAccountDetail">Loan Account</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conditional Fields */}
              {accountType === "SavingAccountDetail" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Account Number" name="acctNum" />
                  <Input label="Saving Account Type ID" name="savingAccTypeId" />
                  <Input label="Balance" name="balance" type="number" />
                  <Input label="Transfer Limit" name="transferLimit" type="number" />
                  <Input label="Branch Code" name="branchCode" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Account Number" name="acctNum" />
                  <Input label="EMI ID" name="emiId" />
                  <Input label="Balance Amount" name="balanceAmount" type="number" />
                  <Input label="Branch Code" name="branchCode" />
                  <Input label="Rate of Interest (%)" name="rateOfInterest" type="number" />
                  <Input label="Loan Duration (months)" name="loanDuration" type="number" />
                  <Input label="Total Loan Amount" name="totalLoanAmount" type="number" />
                  <Input label="Loan Account Type ID" name="loanAccountTypeId" />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-white text-slate-700 border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md hover:scale-[1.02] transition-transform"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

/* Small helper for inputs */
const Input = ({ label, name, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium mb-2 text-slate-700">{label}</label>
    <input
      type={type}
      name={name}
      className="w-full px-4 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition shadow-sm"
      placeholder={`Enter ${label}`}
    />
  </div>
);

export default AddAccountModal;
