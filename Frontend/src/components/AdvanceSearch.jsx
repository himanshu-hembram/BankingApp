import React, { useState } from "react";

export default function CustomerAdvanceSearch({ isOpen, customers = [], onConfirm, onClose }) {
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Normalize text for comparison
  const normalize = (v) => (v ? v.toString().trim().toLowerCase() : "");

  // Handle Search
  const handleSearch = () => {
    const fn = normalize(filters.firstName);
    const ln = normalize(filters.lastName);
    const mb = normalize(filters.mobile);
    const em = normalize(filters.email);

    const results = customers.filter((c) => {
      return (
        (!fn || c.FirstName.toLowerCase().includes(fn)) &&
        (!ln || c.LastName.toLowerCase().includes(ln)) &&
        (!mb || c.Mobile.toLowerCase().includes(mb)) &&
        (!em || c.EmailId.toLowerCase().includes(em))
      );
    });

    setSearchResults(results);
    setHasSearched(true);
    setSelectedId(null);
  };

  // Handle Reset
  const handleReset = () => {
    setFilters({ firstName: "", lastName: "", mobile: "", email: "" });
    setSearchResults([]);
    setHasSearched(false);
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35" role="dialog" aria-modal="true">
      <div className="w-[720px] rounded-[1rem] bg-white border border-slate-300 shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        {/* Titlebar */}
        <div className="flex mt-0 items-center justify-between px-3 py-4 text-white border-indigo-600 bg-indigo-600">
          <span className="font-medium text-lg">Customer Advance Search</span>
          <button className="text-xl leading-none px-2 hover:text-slate-700" onClick={onClose}>×</button>
        </div>

        {/* Middle area: filters + results. fixed overall card height (75vh), this area scrolls */}
        <div className="p-3 overflow-hidden flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="text-xs tracking-wider text-slate-600 mb-2">CUSTOMER FILTER</h3>
            <div className="grid grid-cols-4 gap-2 items-end">
              {["firstName", "lastName", "mobile", "email"].map((field) => {
                const label = {
                  firstName: "First Name",
                  lastName: "Last Name",
                  mobile: "Mobile",
                  email: "Email Address",
                }[field];
                const inputMode = field === "mobile" ? "tel" : field === "email" ? "email" : "text";

                return (
                  <label key={field} className="flex flex-col gap-1 text-xs text-slate-700">
                    <span>{label}:</span>
                    <input
                      className="h-8 rounded border border-slate-300 px-2"
                      value={filters[field]}
                      onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))}
                      inputMode={inputMode}
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button className="h-8 px-4 rounded border border-slate-300 hover:bg-slate-50" onClick={handleReset}>
                Reset
              </button>
              <button className="h-8 px-4 rounded border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          {/* Results area grows and scrolls independently */}
          <div className="flex-1 overflow-auto">
            <div className="text-xs text-slate-600 mb-1">Customer Details</div>
            <ResultsList
              results={searchResults}
              hasSearched={hasSearched}
              onConfirm={onConfirm}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
          <button
            className="h-9 px-4 rounded bg-indigo-600 text-white disabled:bg-indigo-300"
            onClick={() => selectedId && onConfirm(selectedId)}
            disabled={!selectedId}
          >
            OK
          </button>
          <button className="h-9 px-4 rounded border border-slate-300" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsList({ results, hasSearched, onConfirm, selectedId, setSelectedId }) {
  if (!hasSearched) {
    return <div className="border border-slate-200 rounded max-h-72 overflow-auto p-3 text-sm text-slate-500">Enter filters and press Search</div>;
  }

  if (results.length === 0) {
    return <div className="border border-slate-200 rounded max-h-72 overflow-auto p-3 text-sm text-slate-500">No matches found</div>;
  }

  return (
    <div className="border border-slate-200 rounded max-h-72 overflow-auto">
      {results.map((c) => {
        const id = c.CustID;
        const first = c.FirstName;
        const last = c.LastName;
        const mobile = c.Mobile;
        const email = c.EmailId;

        return (
          <div
            key={id}
            role="option"
            tabIndex={0}
            aria-selected={selectedId === id}
            className={`grid grid-cols-[2fr_1fr_2fr] gap-2 px-3 py-2 border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${
              selectedId === id ? "bg-indigo-50 ring-1 ring-indigo-200" : ""
            }`}
            onClick={() => setSelectedId(id)}
            onDoubleClick={() => onConfirm(id)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm(id)}
          >
            <div className="font-medium">{first} {last}</div>
            <div>{mobile}</div>
            <div>{email}</div>
          </div>
        );
      })}
    </div>
  );
}
