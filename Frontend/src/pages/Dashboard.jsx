import React, { useContext } from "react";
import CustomerContext from "../context/CustomerContext";
import {Edit, Trash} from "lucide-react";

export default function Dashboard({ onOpenAdvanceSearch }) {
  const { searchedCustomer, openDialog, deleteCustomer } = useContext(CustomerContext);

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
  const address = `${searchedCustomer.zipcode.city.CityName},
   ${searchedCustomer.zipcode.city.state.StateName}, 
   ${searchedCustomer.zipcode.city.state.country.CountryName},
    ${searchedCustomer.Address1}, ${searchedCustomer.Address2} 
    - ${searchedCustomer.ZIPCode}`;
  // Transaction extraction
  const transactions =
    Array.isArray(accounts) && accounts.length > 0
      ? accounts[0].transactions || []
      : [];

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

          {/* Status + Actions */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                status === "Active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {status}
            </span>

            <button
              type="button"
              onClick={() => openDialog(searchedCustomer)}
              className="h-8 px-3 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-medium"
              aria-label="Edit customer"
              title="Edit customer"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={deleteCustomer}
              className="h-8 px-3 rounded border border-rose-600 text-rose-600 hover:bg-rose-50 text-xs font-medium"
              aria-label="Delete customer"
              title="Delete customer"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
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
              <p className="text-slate-600">
                Address: <span className="text-slate-900">{address || "—"}</span>
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
                  const AccSubType = a.AccSubType ?? a.AccSubType ?? "";
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
                        <p className="text-sm font-normal text-slate-600">{AccSubType}</p>
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

      
      <div className="bg-white shadow rounded-xl border border-slate-200 mt-6 p-6">
      
        
        <div className="w-full overflow-x-auto">
  <table className="min-w-full w-full border border-slate-300 rounded">
    <colgroup>
      <col className="w-[10ch]" />
      <col />
      <col className="w-[12ch]" />
      <col className="w-[12ch]" />
      <col className="w-[12ch]" />
      <col className="w-[14ch]" />
    </colgroup>

    <thead className="bg-slate-100">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">Txn ID</th>
        <th className="px-48 py-2 text-left text-sm font-semibold text-slate-700">Detail</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">Date</th>
        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">Withdraw</th>
        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">Deposit</th>
        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">Balance</th>
      </tr>
    </thead>

    <tbody>
      {transactions.length > 0 ? (
        transactions.map((txn) => (
          <tr key={txn.TxnID} className="bg-white">
            <td className="px-4 py-2 text-sm text-slate-800 whitespace-nowrap">{txn.TxnID}</td>
            <td className="px-4 py-2 text-sm text-slate-800">{txn.TxnDetail || "—"}</td>
            <td className="px-4 py-2 text-sm text-slate-800 whitespace-nowrap">{txn.TxnDate}</td>
            <td className="px-4 py-2 text-sm text-slate-800 text-right tabular-nums whitespace-nowrap">
              {txn.WithdrawAmount ?? "—"}
            </td>
            <td className="px-4 py-2 text-sm text-slate-800 text-right tabular-nums whitespace-nowrap">
              {txn.DepositAmount ?? "—"}
            </td>
            <td className="px-4 py-2 text-sm text-slate-800 text-right tabular-nums whitespace-nowrap">
              {txn.Balance ?? "—"}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={6} className="px-4 py-2 text-center text-slate-500 bg-white">
            No transactions found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}
