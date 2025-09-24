import React, { useState, useEffect } from 'react';


// A reusable input component for consistency
export const FormInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
}) => (
  <div className="flex items-center gap-4">
    <label
      htmlFor={id}
      className="block w-32 text-sm font-medium text-gray-700 whitespace-nowrap"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);


// A reusable select component
const FormSelect = ({ id, label, children, value, onChange, required = false }) => (
  <div className="flex items-center gap-4">
    <label
      htmlFor={id}
      className="block w-32 text-sm font-medium text-gray-700 whitespace-nowrap"
    >
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      {children}
    </select>
  </div>
);


const AddUpdateCustomer = ({ onSave, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    id:'',
    firstName: '',
    lastName: '',
    dob: '',
    maritalStatus: 'Single',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    postalCode: '',
    city: '',
    state: '',
    country: '',
  });

  // Corrected useEffect: Only populates form if initialData is provided.
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        firstName: initialData.first_name || '',
        lastName: initialData.last_name || '',
        dob: initialData.dob || '',
        maritalStatus: initialData.marital_status || 'Single',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address1: initialData.address_line1 || '',
        address2: initialData.address_line2 || '',
        postalCode: initialData.postal_code || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostalChange = async (e) => {
    const code = e.target.value;
    setFormData(prev => ({ ...prev, postalCode: code }));

    if (code.length >= 5) {
      try {  
        const res = await fetch(`https://api.zippopotam.us/in/${code}`);
        if (!res.ok) return;
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          city: data.places[0]["place name"],
          state: data.places[0]["state"],
          country: data.country,
        }));
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Pass the complete data, including the ID if it exists from initialData
    onSave({ ...formData });
  };


  return (
    // The component now uses w-full to fill the container from the parent.
    // The rounded-xl class is now on the wrapper in CustomerPage.jsx
    <div className="bg-white p-8 shadow-lg w-full">
      {/* <h1 className="text-3xl font-bold text-blue-800 text-center mb-2">
        Customer Information
      </h1> */}
      <h1 className="text-center text-gray-500 mb-8"><strong>
        {initialData ? 'Update customer details below.' : 'Add a new customer.'}
        </strong>
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <fieldset className="border-t border-blue-200 pt-6">
          <legend className="text-lg font-semibold text-blue-700 px-2">Personal Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormInput id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
            <FormInput id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
            <FormInput id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} required />
            <FormSelect id="maritalStatus" label="Marital Status" value={formData.maritalStatus} onChange={handleChange} required>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
              <option>Single Parent</option>
            </FormSelect>
            <FormInput id="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
            <FormInput id="phone" label="Phone" type="tel" value={formData.phone} onChange={handleChange} required />
          </div>
        </fieldset>

        {/* Address Section */}
        <fieldset className="border-t border-blue-200 pt-6 mt-8">
          <legend className="text-lg font-semibold text-blue-700 px-2">Address</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <FormInput id="address1" label="Address Line 1" value={formData.address1} onChange={handleChange} required />
            <FormInput id="address2" label="Address Line 2" value={formData.address2} onChange={handleChange} />
            <FormInput id='city' label='City' value={formData.city} onChange={handleChange} />
            <FormInput id='state' label='State' value={formData.state} onChange={handleChange} />
            <FormInput id='country' label='Country' value={formData.country} onChange={handleChange} />
            <FormInput id='postalCode' label='Postal Code' value={formData.postalCode} onChange={handlePostalChange} />
      
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose} // Calls the onClose prop when clicked
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUpdateCustomer;
