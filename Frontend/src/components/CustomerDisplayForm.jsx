import React from 'react';
import { FormInput } from './AddUpdateCustomer';

// A reusable component for displaying a field


const CustomerDisplayForm = ({ customer }) => {
  if (!customer) {
    return (
      <div className="flex items-center justify-center h-full p-6 bg-white rounded-lg shadow-md">
        <p className="text-gray-500">Search for a customer to see their details.</p>
      </div>
    );
  }

  const fullAddress = [
    customer.Address1,
    customer.Address2,
    customer.zipcode.city.CityName,
    customer.zipcode.city.state.StateName,
    customer.zipcode.city.state.country.CountryName,

  ].filter(Boolean).join(', ') + ` - ${customer.ZIPCode || ''}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
  {/* Personal Details Section */}
  <fieldset className="border-t border-blue-200 pt-4">
    <legend className="text-lg font-semibold text-blue-700 px-2">Personal Information</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <FormInput label="First Name" value={customer.FirstName} />
      <FormInput label="Last Name" value={customer.LastName} />
      <FormInput label="Date of Birth" value={customer.DOB} />
      <FormInput label="Marital Status" value={customer.MaritalStatus} />
      <FormInput label="EmailID" value={customer.EmailID} />
      <FormInput label="Phone" value={customer.Phone } />
    </div>
  </fieldset>

  {/* Address Section */}
  <fieldset className="border-t border-blue-200 pt-4 mt-6">
    <legend className="text-lg font-semibold text-blue-700 px-2">Address Information</legend>
    <div className="mt-4">
      <FormInput label="Address" value={fullAddress} />
    </div>
  </fieldset>
</div>

  );
};

export default CustomerDisplayForm;