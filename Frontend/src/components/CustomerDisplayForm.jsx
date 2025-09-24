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
    customer.address_line1,
    customer.address_line2,
    customer.city,
    customer.state,
    customer.country,
    
  ].filter(Boolean).join(', ') + ` - ${customer.postal_code || ''}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
  {/* Personal Details Section */}
  <fieldset className="border-t border-blue-200 pt-4">
    <legend className="text-lg font-semibold text-blue-700 px-2">Personal Information</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <FormInput label="First Name" value={customer.first_name} />
      <FormInput label="Last Name" value={customer.last_name} />
      <FormInput label="Date of Birth" value={customer.dob} />
      <FormInput label="Marital Status" value={customer.marital_status} />
      <FormInput label="Email" value={customer.email} />
      <FormInput label="Phone" value={customer.phone} />
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