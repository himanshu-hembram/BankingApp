import React from "react";
import {
  User,
  Calendar,
  Heart,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"; // icons

const InfoItem = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg bg-gradient-to-r from-slate-50 to-white shadow-sm hover:shadow-md transition">
      <div className="p-2 bg-indigo-100 rounded-full">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
};

const CustomerDisplayForm = ({ customer }) => {
  if (!customer) {
    return (
      <div className="flex items-center justify-center h-full p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">
          Search for a customer to see their details.
        </p>
      </div>
    );
  }

  const fullAddress =
    [
      customer.Address1,
      customer.Address2,
      customer.zipcode?.city?.CityName,
      customer.zipcode?.city?.state?.StateName,
      customer.zipcode?.city?.state?.country?.CountryName,
    ]
      .filter(Boolean)
      .join(", ") + ` - ${customer.ZIPCode || ""}`;

  return (
    <div className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl space-y-6">
      {/* Personal Info */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-3">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoItem icon={User} label="First Name" value={customer.FirstName} />
          <InfoItem icon={User} label="Last Name" value={customer.LastName} />
          <InfoItem icon={Calendar} label="Date of Birth" value={customer.DOB} />
          <InfoItem
            icon={Heart}
            label="Marital Status"
            value={customer.MaritalStatus}
          />
          <InfoItem icon={Mail} label="Email ID" value={customer.EmailID} />
          <InfoItem icon={Phone} label="Phone" value={customer.Phone} />
        </div>
      </div>

      {/* Address */}
      <div>
        <h2 className="text-lg font-semibold text-indigo-700 border-b pb-2 mb-3">
          Address Information
        </h2>
        <InfoItem icon={MapPin} label="Address" value={fullAddress} />
      </div>
    </div>
  );
};

export default CustomerDisplayForm;
