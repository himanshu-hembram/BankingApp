import React, { useState } from 'react';
import { Loader2, Save, X, CheckCircle } from 'lucide-react';
import api from '../lib/api'; // We will use this to make the API call

const POSTAL_CODE_API = 'https://api.zippopotam.us/in/';

const initialFormState = {
  firstName: '', lastName: '', address1: '', address2: '', emailId: '', phone: '',
  mobile: '', dob: '', maritalStatus: '', postalCode: '', city: '', state: '', country: '',
};

function AddCustomerPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [isPostalLoading, setIsPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostalCodeChange = async (e) => {
    const postalCode = e.target.value;
    handleChange(e);
    if (postalCode.length > 5) {
      setIsPostalLoading(true); setPostalError('');
      try {
        const response = await fetch(`${POSTAL_CODE_API}${postalCode}`);
        if (!response.ok) throw new Error('Invalid Postal Code');
        const data = await response.json();
        const location = data.places[0];
        setFormData(prev => ({ ...prev, city: location['place name'], state: location['state'], country: data['country'] }));
      } catch (err) { setPostalError(err.message); } 
      finally { setIsPostalLoading(false); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      // The API call is now made directly in this file using the 'api' instance.
      // Replace '/api/customers' with your actual backend endpoint.
      console.log('Submitting form data:', formData);
      await api.post('/customers', formData);

      setSuccessMessage('Customer has been saved successfully!');
      setFormData(initialFormState); // Reset form on success

    } catch (err) {
      // Check for a specific error message from the backend, otherwise show a generic one.
      const errorMessage = err.response?.data?.detail || 'Failed to save customer. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-8">Create New Customer</h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-6">Personal Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField label="First Name" name="FirstName" value={formData.firstName} onChange={handleChange} required />
              <FormField label="Last Name" name="LastName" value={formData.lastName} onChange={handleChange} required />
              <FormField label="Date of Birth" name="DOB" type="date" value={formData.dob} onChange={handleChange} required />
              <FormField label="Marital Status" name="MaritalStatus" type="select" value={formData.maritalStatus} onChange={handleChange} required>
                <option value="">Select...</option><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option>
              </FormField>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-6">Contact Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField label="Email Address" name="EmailID" type="email" value={formData.emailId} onChange={handleChange} required className="md:col-span-2"/>
              <FormField label="Mobile Number" name="Mobile" type="tel" value={formData.mobile} onChange={handleChange} required />
              <FormField label="Phone Number" name="Phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Optional" />
            </div>
          </fieldset>
          
          <fieldset>
            <legend className="text-lg font-semibold text-gray-700 mb-6">Address</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField label="Address Line 1" name="Address1" value={formData.address1} onChange={handleChange} required className="md:col-span-2"/>
              <FormField label="Address Line 2" name="Address2" value={formData.address2} onChange={handleChange} placeholder="Optional" className="md:col-span-2"/>
              <FormField label="Postal Code" name="ZIPCode" value={formData.postalCode} onChange={handlePostalCodeChange} required loading={isPostalLoading} error={postalError} />
              <FormField label="City" name="CityName" value={formData.city} onChange={handleChange} readOnly />
              <FormField label="State" name="StateName" value={formData.state} onChange={handleChange} readOnly />
              <FormField label="Country" name="CountryName" value={formData.country} onChange={handleChange} readOnly />
            </div>
          </fieldset>
          
          <div className="pt-6 mt-8 border-t border-gray-200">
            {successMessage && <div className="flex items-center p-4 mb-4 text-sm text-green-800 bg-green-100 rounded-lg"><CheckCircle size={20} className="mr-3"/>{successMessage}</div>}
            {submitError && <div className="flex items-center p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg"><X size={20} className="mr-3"/>{submitError}</div>}
            <div className="flex justify-end items-center gap-4">
              <button type="button" className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {isSubmitting ? <Loader2 size={16} className="mr-2 animate-spin"/> : <Save size={16} className="mr-2"/>}
                {isSubmitting ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// FormField component with an inline layout
const FormField = ({ label, name, type = 'text', children, className = '', loading, error, ...props }) => {
  const InputComponent = type === 'select' ? 'select' : 'input';
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 sm:items-start sm:gap-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:pt-2">
        {label}
      </label>
      <div className="relative sm:col-span-2">
        <InputComponent
          id={name} name={name} type={type}
          className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors ${props.readOnly ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
          {...props}
        >
          {children}
        </InputComponent>
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default AddCustomerPage;
