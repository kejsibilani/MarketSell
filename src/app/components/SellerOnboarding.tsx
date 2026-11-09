import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Package, MapPin, Building, Mail, Lock } from 'lucide-react';
import { MOCK_PRODUCT_CATEGORIES } from './SystemTablesManagement';
import { getCountryFlag } from '../utils/countryFlags';

interface OnboardingFormData {
  productCategories: string[];
  shippingCountries: string[];
  companyName: string;
  additionalCompanies: string[];
  hasMultipleCompanies: boolean;
  contactName: string;
  contactEmail: string;
  password: string;
  userType: 'seller' | 'agent';
}

const SHIPPING_COUNTRIES = [
  { id: 'spain', name: 'Spain', code: 'ES' },
  { id: 'portugal', name: 'Portugal', code: 'PT' },
  { id: 'italy', name: 'Italy', code: 'IT' },
  { id: 'france', name: 'France', code: 'FR' },
  { id: 'north-africa', name: 'North Africa', code: 'MA' }, // Uses Morocco flag as regional fallback
  { id: 'turkey', name: 'Turkey', code: 'TR' },
  { id: 'colombia', name: 'Colombia', code: 'CO' },
  { id: 'greece', name: 'Greece', code: 'GR' },
];

// Fallback helper to convert ISO country code to Emoji flag
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
  );
};

export default function SellerOnboarding({
  onComplete,
  userType = 'seller',
}: {
  onComplete?: (data: OnboardingFormData) => void;
  userType?: 'seller' | 'agent';
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    productCategories: [],
    shippingCountries: [],
    companyName: '',
    additionalCompanies: [],
    hasMultipleCompanies: false,
    contactName: '',
    contactEmail: '',
    password: '',
    userType,
  });

  const totalSteps = 3;

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(categoryId)
        ? prev.productCategories.filter(id => id !== categoryId)
        : [...prev.productCategories, categoryId],
    }));
  };

  const handleCountryToggle = (countryId: string) => {
    setFormData(prev => ({
      ...prev,
      shippingCountries: prev.shippingCountries.includes(countryId)
        ? prev.shippingCountries.filter(id => id !== countryId)
        : [...prev.shippingCountries, countryId],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.productCategories.length > 0;
      case 2:
        return formData.shippingCountries.length > 0;
      case 3:
        return (
          formData.companyName.trim() !== '' &&
          formData.contactName.trim() !== '' &&
          formData.contactEmail.trim() !== '' &&
          formData.password.trim() !== ''
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      onComplete?.(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userType === 'seller' ? 'Register as a Seller' : 'Register as an Agent'}
            </h1>
            <p className="text-gray-600">
              {userType === 'seller'
                ? 'Join our marketplace and start selling your products to buyers across Europe and beyond.'
                : 'Join our network and earn commissions by connecting buyers with our inventory.'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-2 rounded-full mx-1 ${
                    idx + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              Step {step} of {totalSteps}
            </p>
          </div>

          {/* Step 1: Product Categories */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <Package className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      What type of products would you like to sell on our platform?
                    </h2>
                    <p className="text-sm text-gray-600">
                      Select all product categories that apply
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOCK_PRODUCT_CATEGORIES.map(category => {
                    const isSelected = formData.productCategories.includes(category.key);
                    const categoryName =
                      category.translations.find(t => t.language === 'en')?.value || category.key;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.key)}
                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-sm">{categoryName}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping Countries */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      From which countries would handle your products?
                    </h2>
                    <p className="text-sm text-gray-600">
                      Select all countries where you can source or ship products from
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {SHIPPING_COUNTRIES.map(country => {
                    const isSelected = formData.shippingCountries.includes(country.id);
                    // Resolve flag via getCountryFlag utility or fallback Emoji code
                    const countryFlag =
                      getCountryFlag(country.name) ||
                      getCountryFlag(country.code) ||
                      getFlagEmoji(country.code);

                    return (
                      <button
                        key={country.id}
                        onClick={() => handleCountryToggle(country.id)}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl leading-none">{countryFlag}</span>
                        <span className="font-medium text-gray-900 flex-1">{country.name}</span>
                        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <Building className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Complete your registration
                    </h2>
                    <p className="text-sm text-gray-600">
                      Please enter your details to create your account
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {userType === 'agent' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!formData.companyName}
                          onChange={e => {
                            if (!e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                companyName: '',
                                hasMultipleCompanies: false,
                                additionalCompanies: [],
                              }));
                            } else {
                              setFormData(prev => ({ ...prev, companyName: ' ' }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          I have a company
                        </span>
                      </label>
                      <p className="text-xs text-gray-600 mt-1 ml-6">
                        Agents can work with or without a registered company
                      </p>
                    </div>
                  )}

                  {(userType === 'seller' || (userType === 'agent' && formData.companyName)) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What is the name of your company? *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName.trim()}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, companyName: e.target.value }))
                          }
                          placeholder="Enter your company name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={userType === 'seller'}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.hasMultipleCompanies}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                hasMultipleCompanies: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            I have more than one company
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                          You can add additional companies after registration in Account Settings
                        </p>
                      </div>

                      {formData.hasMultipleCompanies && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Company Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter another company name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={e => {
                              if (e.target.value.trim()) {
                                setFormData(prev => ({
                                  ...prev,
                                  additionalCompanies: [
                                    ...prev.additionalCompanies,
                                    e.target.value.trim(),
                                  ],
                                }));
                                e.target.value = '';
                              }
                            }}
                          />
                          {formData.additionalCompanies.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {formData.additionalCompanies.map((company, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                                >
                                  <span className="text-sm text-gray-700">{company}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData(prev => ({
                                        ...prev,
                                        additionalCompanies: prev.additionalCompanies.filter(
                                          (_, i) => i !== idx
                                        ),
                                      }))
                                    }
                                    className="text-red-600 text-sm hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What is your name (it can be changed in your profile later)? *
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, contactName: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, contactEmail: e.target.value }))
                      }
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Identification email will be sent to your email address to verify ownership of account
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, password: e.target.value }))
                      }
                      placeholder="Enter a secure password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Please enter your password to protect your application. Identification email will be sent to your email for verification and disclaimer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Application
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}