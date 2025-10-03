import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Loader2, Save, X, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import CustomerContext from '../context/CustomerContext';
import { useNavigate } from 'react-router-dom'; // <-- useNavigate

const POSTAL_CODE_API = 'https://api.zippopotam.us/in/';

const initialFormState = {
  FirstName: '',
  LastName: '',
  Address1: '',
  Address2: '',
  EmailID: '',
  Phone: '',
  Mobile: '',
  DOB: '',
  MaritalStatus: '',
  ZIPCode: '',
  CityName: '',
  StateName: '',
  CountryName: '',
};

function UpdateCustomerPage() {
  const { searchedCustomer, searchCustomer } = useContext(CustomerContext);
  const navigate = useNavigate(); // <-- useNavigate hook

  const resolvedId = useMemo(() => {
    if (!searchedCustomer) return '';
    return (
      searchedCustomer.CustID ??
      searchedCustomer.custId ??
      searchedCustomer.id ??
      ''
    ).toString();
  }, [searchedCustomer]);

  const [formData, setFormData] = useState(initialFormState);
  const [isPostalLoading, setIsPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hydrate form with searchedCustomer when provided
  useEffect(() => {
    if (!searchedCustomer) return;

    setFormData({
      FirstName: searchedCustomer.FirstName ?? searchedCustomer.firstName ?? '',
      LastName: searchedCustomer.LastName ?? searchedCustomer.lastName ?? '',
      Address1: searchedCustomer.Address1 ?? searchedCustomer.address1 ?? '',
      Address2: searchedCustomer.Address2 ?? searchedCustomer.address2 ?? '',
      EmailID: searchedCustomer.EmailID ?? searchedCustomer.email ?? searchedCustomer.Email ?? '',
      Phone: searchedCustomer.Phone ?? searchedCustomer.phone ?? '',
      Mobile: searchedCustomer.Mobile ?? searchedCustomer.mobile ?? '',
      DOB: searchedCustomer.DOB ?? searchedCustomer.dob ?? '',
      MaritalStatus: searchedCustomer.MaritalStatus ?? searchedCustomer.maritalStatus ?? '',
      ZIPCode: searchedCustomer.ZIPCode ?? searchedCustomer.zip ?? searchedCustomer.postalCode ?? '',
      CityName: searchedCustomer.zipcode?.city?.CityName ?? searchedCustomer.city ?? '',
      StateName: searchedCustomer.zipcode?.city?.state?.StateName ?? searchedCustomer.state ?? '',
      CountryName: searchedCustomer.zipcode?.city?.state?.country?.CountryName ?? searchedCustomer.country ?? '',
    });
  }, [searchedCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostalCodeChange = async (e) => {
    const postalCode = e.target.value;
    handleChange(e);
    if (postalCode.length > 5) {
      setIsPostalLoading(true);
      setPostalError('');
      try {
        const response = await fetch(`${POSTAL_CODE_API}${postalCode}`);
        if (!response.ok) throw new Error('Invalid Postal Code');
        const data = await response.json();
        const location = data.places?.[0];
        setFormData((prev) => ({
          ...prev,
          CityName: location?.['place name'] ?? prev.CityName,
          StateName: location?.['state'] ?? prev.StateName,
          CountryName: data?.['country'] ?? prev.CountryName,
        }));
      } catch (err) {
        setPostalError(err.message);
      } finally {
        setIsPostalLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      if (!resolvedId) {
        throw new Error('Missing customer id. Cannot update.');
      }

      await api.put(`/customers/${encodeURIComponent(resolvedId)}`, formData);
      setSuccessMessage('Customer has been updated successfully!');
      // Refresh searchedCustomer in context
      await searchCustomer(resolvedId);
      navigate('/dashboard'); // <-- navigate to dashboard
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Failed to update customer. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleCancel() {
    setFormData(initialFormState);
    navigate('/dashboard'); // <-- navigate to dashboard

  }

  if (!searchedCustomer) {
    return (
      <div className="w-full h-full">
        <div className="bg-white pt-3 md:pt-3 rounded-lg shadow-sm border border-gray-200 w-full">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-5 mb-2">
            Update Customer
          </h3>
          <div className="p-4 text-sm text-gray-600">
            No customer selected. Please choose a customer first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-white pt-3 md:pt-3 rounded-lg shadow-sm border border-gray-200 w-full">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-5 mb-2">
          Update Customer
        </h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Personal Details */}
          <fieldset>
            <legend className="text-lg font-medium text-gray-700 mb-4">
              Personal Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Last Name"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Date of Birth"
                name="DOB"
                type="date"
                value={formData.DOB}
                onChange={handleChange}
                required
              />
              <FormField
                label="Marital Status"
                name="MaritalStatus"
                type="select"
                value={formData.MaritalStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </FormField>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset>
            <legend className="text-lg font-medium text-gray-700 mb-4">
              Contact Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Email Address"
                name="EmailID"
                type="email"
                value={formData.EmailID}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Mobile Number"
                name="Mobile"
                type="tel"
                value={formData.Mobile}
                onChange={handleChange}
                required
              />
              <FormField
                label="Phone Number"
                name="Phone"
                type="tel"
                value={formData.Phone}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>
          </fieldset>

          {/* Address */}
          <fieldset>
            <legend className="text-lg font-medium text-gray-700 mb-4">
              Address
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Address Line 1"
                name="Address1"
                value={formData.Address1}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <FormField
                label="Address Line 2"
                name="Address2"
                value={formData.Address2}
                onChange={handleChange}
                placeholder="Optional"
                className="md:col-span-2"
              />
              <FormField
                label="Postal Code"
                name="ZIPCode"
                value={formData.ZIPCode}
                onChange={handlePostalCodeChange}
                required
                loading={isPostalLoading}
                error={postalError}
              />
              <FormField
                label="City"
                name="CityName"
                value={formData.CityName}
                onChange={handleChange}
              />
              <FormField
                label="State"
                name="StateName"
                value={formData.StateName}
                onChange={handleChange}
              />
              <FormField
                label="Country"
                name="CountryName"
                value={formData.CountryName}
                onChange={handleChange}
              />
            </div>
          </fieldset>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-200">
            {successMessage && (
              <div className="flex items-center p-3 mb-3 text-sm text-green-800 bg-green-100 rounded-md">
                <CheckCircle size={18} className="mr-2" />
                {successMessage}
              </div>
            )}
            {submitError && (
              <div className="flex items-center p-3 mb-3 text-sm text-red-800 bg-red-100 rounded-md">
                <X size={18} className="mr-2" />
                {submitError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {isSubmitting ? 'Saving...' : 'Update Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const FormField = ({
  label,
  name,
  type = 'text',
  children,
  className = '',
  loading,
  error,
  ...props
}) => {
  const InputComponent = type === 'select' ? 'select' : 'input';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      <label htmlFor={name} className="w-32 text-sm font-medium text-gray-700 shrink-0">
        {label}
      </label>
      <div className="relative flex-1">
        <InputComponent
          id={name}
          name={name}
          type={type}
          className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm ${
            props.readOnly
              ? 'bg-gray-100 border-gray-300'
              : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
          }`}
          {...props}
        >
          {children}
        </InputComponent>
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default UpdateCustomerPage;
