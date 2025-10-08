import React, { useState, useContext, useMemo } from "react";
import CustomerContext from "../context/CustomerContext";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export default function TransactionPage() {
  const { makeDeposit, makeWithdrawal, searchedCustomer } =
    useContext(CustomerContext);

  const [type, setType] = useState("deposit");
  const [form, setForm] = useState({
    acctNum: "",
    amount: "",
    txnDetail: "",
  });
  const [loading, setLoading] = useState(false);

  // Normalize account list (handles different backend property names)
  const accountList = useMemo(() => {
    if (!searchedCustomer) return [];
    return (
      searchedCustomer.accounts ||
      searchedCustomer.Accounts ||
      searchedCustomer.accountList ||
      []
    );
  }, [searchedCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.acctNum || !form.amount) {
      alert("Please select an account and enter amount.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        acctNum: Number(form.acctNum),
        amount: Number(form.amount),
        txnDetail: form.txnDetail || (type === "deposit" ? "Deposit" : "Withdrawal"),
      };

      if (type === "deposit") {
        await makeDeposit(payload);
      } else {
        await makeWithdrawal(payload);
      }

      setForm({ acctNum: "", amount: "", txnDetail: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-10 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 border border-slate-200">
        <h1 className="text-2xl font-semibold text-center mb-6 text-slate-700">
          {type === "deposit" ? "Deposit Money" : "Withdraw Money"}
        </h1>

        {/* Toggle buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setType("deposit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "deposit"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ArrowDownCircle size={18} /> Deposit
          </button>
          <button
            onClick={() => setType("withdraw")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              type === "withdraw"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ArrowUpCircle size={18} /> Withdraw
          </button>
        </div>

        {/* If no customer selected */}
        {!searchedCustomer ? (
          <div className="text-center text-slate-500">
            <p>Please search for a customer first.</p>
          </div>
        ) : (
          <>
            {/* Customer Info */}
            <div className="mb-5 bg-slate-50 rounded-lg p-3 border text-sm">
              <p className="font-medium text-slate-700 flex items-center gap-2">
                <Wallet size={16} className="text-indigo-600" />{" "}
                {searchedCustomer.FirstName} {searchedCustomer.LastName}
              </p>
              <p className="text-slate-500">
                ID: {searchedCustomer.CustID || searchedCustomer.custId}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Select Account
                </label>
                <select
                  name="acctNum"
                  value={form.acctNum}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Select Account --</option>
                  {accountList.map((acc, i) => (
                    <option key={i} value={acc.AcctNum ?? acc.accountNumber}>
                      {acc.AccountType || acc.type || "Account"} —{" "}
                      {acc.AcctNum ?? acc.accountNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Transaction Detail */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Transaction Details (optional)
                </label>
                <input
                  type="text"
                  name="txnDetail"
                  value={form.txnDetail}
                  onChange={handleChange}
                  placeholder="e.g. Cash Deposit, ATM Withdrawal"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 mt-2 rounded-lg font-semibold text-white transition ${
                  type === "deposit"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {loading
                  ? "Processing..."
                  : type === "deposit"
                  ? "Deposit"
                  : "Withdraw"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
