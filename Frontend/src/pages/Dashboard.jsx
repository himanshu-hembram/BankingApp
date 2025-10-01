// src/pages/CustomerDashboard.jsx
import React, { useContext } from "react";
import CustomerContext from "../context/CustomerContext";

export default function Dashboard({ onOpenAdvanceSearch }) {
  const { searchedCustomer } = useContext(CustomerContext);


  // Hydrate from localStorage on mount to restore last selected customer
  // useEffect(() => {
  
  //   (async () => {
  //     try {
  //       const lastId = localStorage.getItem("selectedCustId");
  //       if (!searchedCustomer && lastId) {
  //         await searchCustomer(lastId);
  //       }
  //     } catch {
  //       // ignore; render empty state if fetch fails
  //     } })();
  // }, [searchedCustomer, searchCustomer]);



  // Empty state prompting Advance Search
  if (!searchedCustomer) {
    return (
      <div className="grid place-items-center h-[40vh]">
        <div className="text-center space-y-3">
          <div className="text-slate-700">No customer selected</div>
          <div className="text-slate-500 text-sm">
            Open Advance Search and select a customer to display details here.
          </div>
          {onOpenAdvanceSearch && (
            <button
              type="button"
              className="h-9 px-4 rounded border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500"
              onClick={onOpenAdvanceSearch}
            >
              Advance Search
            </button>
          )}
        </div>
      </div>
    );
  }

  // Field fallbacks for different API casings
  const id =
    searchedCustomer.CustID ??
    searchedCustomer.custId ??
    searchedCustomer.id ??
    "";
  const firstName =
    searchedCustomer.firstName ?? searchedCustomer.FirstName ?? "";
  const lastName = searchedCustomer.lastName ?? searchedCustomer.LastName ?? "";
  const mobile =
    searchedCustomer.Mobile ??
    searchedCustomer.Phone ??
    searchedCustomer.mobile ??
    "";
  const email = searchedCustomer.email ?? searchedCustomer.EmailID ?? "";
  const status = searchedCustomer.status ?? "Active";
  const accounts =
    searchedCustomer.accounts ??
    searchedCustomer.Accounts ??
    searchedCustomer.accountList ??
    [];

  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    "?";

  return (
    <div className="space-y-4">
      {/* Header card */}
     <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-slate-200">
  {/* Header */}
  <div className="flex items-center justify-between p-5 border-b border-slate-200">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-indigo-600 text-white grid place-items-center font-semibold">
        {initials}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {firstName} {lastName}
        </h2>
        <p className="text-xs text-slate-500">Customer ID: {id || "—"}</p>
      </div>
    </div>
    <span
      className={`text-xs px-2 py-1 rounded-full border ${
        status === "Active"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </span>
  </div>

  {/* Content Sections */}
  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
    
    {/* Contact */}
    <div className="p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact</h3>
      <div className="text-sm space-y-2">
        <p className="text-slate-600">
          Mobile: <span className="text-slate-900">{mobile || "—"}</span>
        </p>
        <p className="text-slate-600">
          Email: <span className="text-slate-900">{email || "—"}</span>
        </p>
      </div>
    </div>

    {/* Accounts */}
    <div className="p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Linked Accounts
      </h3>
      {Array.isArray(accounts) && accounts.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {accounts.map((a, idx) => {
            const type = a.type ?? a.AccountType ?? "Account";
            const accNo =
              a.accountNo ?? a.AccountNumber ?? a.AcctNum ?? idx + 1;
            const balance =
              a.balance ?? a.availableBalance ?? a.Balance ?? null;

            const formattedBalance =
              typeof balance === "number"
                ? balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })
                : balance || "—";

            return (
              <li
                key={`${accNo}-${idx}`}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{type}</p>
                  <p className="text-xs text-slate-500">#{accNo}</p>
                </div>
                <p className="text-sm font-bold text-emerald-600">
                  ₹ {formattedBalance}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No linked accounts</p>
      )}
    </div>

    {/* Profile */}
    <div className="p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Profile</h3>
      <div className="text-sm space-y-2">
        <p className="text-slate-600">
          Status: <span className="text-slate-900">{status}</span>
        </p>
        <p className="text-slate-600">
          Name:{" "}
          <span className="text-slate-900">
            {firstName} {lastName}
          </span>
        </p>
        <p className="text-slate-600">
          Customer ID: <span className="text-slate-900">{id || "—"}</span>
        </p>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
