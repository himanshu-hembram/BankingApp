// src/components/CustomerAdvanceSearch.jsx
import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import CustomerContext from "../context/CustomerContext";
import {CircleX} from 'lucide-react';

export default function AdvanceSearch({ isOpen, onClose, onAfterSelect }) {
  const { advanceSearchCustomers, searchCustomer } = useContext(CustomerContext);

  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const prevFocusRef = useRef(null);

  // Focus trap + Esc + outside click
  useEffect(() => {
    if (!isOpen) return;

    prevFocusRef.current = document.activeElement;

    // Initial focus
    const t = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusable);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    const handleMouseDown = (e) => {
      if (e.target === overlayRef.current) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    overlayRef.current?.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleKeyDown, true);
      overlayRef.current?.removeEventListener("mousedown", handleMouseDown, true);
      // Restore focus to the previous element
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === "function") {
        prevFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleSearch = useCallback(async () => {
    const data = await advanceSearchCustomers(filters);
    setSearchResults(data || []);
    setHasSearched(true);
    setSelectedId(null);
  }, [advanceSearchCustomers, filters]);

  const handleReset = useCallback(() => {
    setFilters({ firstName: "", lastName: "", mobile: "", email: "" });
    setSearchResults([]);
    setHasSearched(false);
    setSelectedId(null);
    firstInputRef.current?.focus();
  }, []);

  const titleId = "adv-search-title";

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 grid place-items-center bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={dialogRef}
        className="w-[720px] rounded-[1rem] bg-white border border-slate-300 shadow-2xl overflow-hidden flex flex-col h-[75vh]"
      >
        {/* Titlebar */}
        <div className="flex items-center justify-between px-3 py-4 text-white border-indigo-600 bg-indigo-600">
          <span id={titleId} className="font-medium text-lg">
            Customer Advance Search
          </span>
          <button
            className="text-xl leading-none px-2 hover:text-slate-200"
            aria-label="Close dialog"
            onClick={onClose}
            type="button"
            
          >
            <CircleX size={18} />
          </button>
        </div>

        {/* Middle area: filters + results */}
        <div className="p-3 overflow-hidden flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="text-xs tracking-wider text-slate-600 mb-2">CUSTOMER FILTER</h3>
            <div className="grid grid-cols-4 gap-2 items-end">
              {/* First Name */}
              <label className="flex flex-col gap-1 text-xs text-slate-700">
                <span>First Name:</span>
                <input
                  ref={firstInputRef}
                  className="h-8 rounded border border-slate-300 px-2"
                  value={filters.firstName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, firstName: e.target.value }))}
                  inputMode="text"
                  placeholder="e.g. John"
                />
              </label>

              {/* Last Name */}
              <label className="flex flex-col gap-1 text-xs text-slate-700">
                <span>Last Name:</span>
                <input
                  className="h-8 rounded border border-slate-300 px-2"
                  value={filters.lastName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, lastName: e.target.value }))}
                  inputMode="text"
                  placeholder="e.g. Doe"
                />
              </label>

              {/* Mobile */}
              <label className="flex flex-col gap-1 text-xs text-slate-700">
                <span>Mobile:</span>
                <input
                  className="h-8 rounded border border-slate-300 px-2"
                  value={filters.mobile}
                  onChange={(e) => setFilters((prev) => ({ ...prev, mobile: e.target.value }))}
                  inputMode="tel"
                  placeholder="e.g. 9876543210"
                />
              </label>

              {/* Email */}
              <label className="flex flex-col gap-1 text-xs text-slate-700">
                <span>Email Address:</span>
                <input
                  className="h-8 rounded border border-slate-300 px-2"
                  value={filters.email}
                  onChange={(e) => setFilters((prev) => ({ ...prev, email: e.target.value }))}
                  inputMode="email"
                  placeholder="e.g. john@example.com"
                />
              </label>
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                className="h-8 px-4 rounded border border-slate-300 hover:bg-slate-50"
                onClick={handleReset}
                type="button"
              >
                Reset
              </button>
              <button
                className="h-8 px-4 rounded border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={handleSearch}
                type="button"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results area */}
          <div className="flex-1 overflow-auto">
            <div className="text-xs text-slate-600 mb-1">Customer Details</div>
            <ResultsList
              results={searchResults}
              hasSearched={hasSearched}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onClose={onClose}
              onAfterSelect={onAfterSelect}
              onSelectCustomer={searchCustomer} // fetch full details on row click
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
          <button className="h-9 px-4 rounded border border-slate-300" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsList({
  results,
  hasSearched,
  selectedId,
  setSelectedId,
  onSelectCustomer,
  onClose,
  onAfterSelect,
}) {
  const listRef = useRef(null);

  if (!hasSearched) {
    return (
      <div className="border border-slate-200 rounded max-h-72 overflow-auto p-3 text-sm text-slate-500">
        Enter filters and press Search
      </div>
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return (
      <div className="border border-slate-200 rounded max-h-72 overflow-auto p-3 text-sm text-slate-500">
        No matches found
      </div>
    );
  }

  const handleActivate = async (id) => {
    if (!id) return;
    await onSelectCustomer(id); // updates context + localStorage
    onClose?.();
    onAfterSelect?.(); // optional: navigate('/customer')
  };

  const getId = (c) => c.custId ?? c.CustID ?? c.id;

  return (
    <div
      ref={listRef}
      className="border border-slate-200 rounded max-h-72 overflow-auto"
      role="listbox"
      aria-label="Search results"
    >
      {results.map((c, idx) => {
        const id = getId(c);
        const first = c.firstName ?? c.FirstName ?? "";
        const last = c.lastName ?? c.LastName ?? "";
        const mobile = c.phone ?? c.mobile ?? c.Mobile ?? "";
        const email = c.email ?? c.Email ?? "";

        const isSelected = selectedId === id;

        return (
          <div
            key={`${id}-${idx}`}
            role="option"
            tabIndex={0}
            aria-selected={isSelected}
            className={`grid grid-cols-[2fr_1fr_2fr] gap-2 px-3 py-2 border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${
              isSelected ? "bg-indigo-50 ring-1 ring-indigo-200" : ""
            }`}
            onClick={() => {
              setSelectedId(id);
              handleActivate(id);
            }}
            onDoubleClick={() => handleActivate(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleActivate(id);
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const items = Array.from(listRef.current.querySelectorAll('[role="option"]'));
                const currentIndex = items.findIndex((el) => el === e.currentTarget);
                const nextIndex =
                  e.key === "ArrowDown"
                    ? Math.min(items.length - 1, currentIndex + 1)
                    : Math.max(0, currentIndex - 1);
                const nextEl = items[nextIndex];
                nextEl?.focus();
                const nextId = getId(results[nextIndex]);
                setSelectedId(nextId);
              }
            }}
          >
            <div className="font-medium truncate">{first} {last}</div>
            <div className="truncate">{mobile}</div>
            <div className="truncate">{email}</div>
          </div>
        );
      })}
    </div>
  );
}
