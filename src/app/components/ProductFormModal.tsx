import { useState } from 'react';
import { X, Upload, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: any;
}

export function ProductFormModal({ isOpen, onClose, onSave, product }: ProductFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Green Coffee',
    origin: product?.origin || '',
    price: product?.price || '',
    stock: product?.stock || '',
    warehouse: product?.warehouse || 'Rotterdam',
    lot: product?.lot || '',
    image: product?.image || '',
  });

  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [isDragging, setIsDragging] = useState(false);

  const totalSteps = 3;

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSave({
        ...formData,
        id: product?.id || `${Date.now()}`,
        status: 'selling',
        demand: 'medium',
        owner: 'Costa Coffee Co.',
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0B1F3A]">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step === currentStep
                        ? 'bg-[#0B1F3A] text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  <p className="text-xs mt-2 text-gray-600 text-center">
                    {step === 1 ? 'Branding' : step === 2 ? 'Classification' : 'Inventory'}
                  </p>
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Branding & Identity */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#0B1F3A] mb-1">Branding & Identity</h3>
                <p className="text-sm text-gray-600">
                  This is crucial for your brand identity and how buyers will recognize your products in the marketplace. A strong product name and appealing photo create lasting first impressions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Photo
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[#0B1F3A] bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Drag and drop your image here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                  placeholder="e.g., Colombian Supremo"
                />
              </div>
            </div>
          )}

          {/* Step 2: Product Classification */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#0B1F3A] mb-1">Product Classification</h3>
                <p className="text-sm text-gray-600">
                  Proper classification helps buyers find your products and ensures you're targeting the right market segments. Origin details build trust and transparency with international buyers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                >
                  <option value="Green Coffee">Green Coffee</option>
                  <option value="Roasted Coffee">Roasted Coffee</option>
                  <option value="Specialty Coffee">Specialty Coffee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin *
                </label>
                <input
                  type="text"
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                  placeholder="e.g., Colombia, Brazil"
                />
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Inventory */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#0B1F3A] mb-1">Pricing & Inventory Management</h3>
                <p className="text-sm text-gray-600">
                  Accurate pricing and inventory tracking are essential for successful order fulfillment and maintaining buyer trust. Warehouse location affects shipping costs and delivery times.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per kg (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                    placeholder="8.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                    placeholder="2400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse *
                  </label>
                  <select
                    required
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                  >
                    <option value="Rotterdam">Rotterdam</option>
                    <option value="Santos">Santos</option>
                    <option value="Hamburg">Hamburg</option>
                    <option value="Amsterdam">Amsterdam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    value={formData.lot}
                    onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent"
                    placeholder="LOT-2024-001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {currentStep === 1 ? (
                'Cancel'
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </>
              )}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-[#0B1F3A] text-white rounded-lg hover:bg-[#0B1F3A]/90 font-medium"
            >
              {currentStep === totalSteps ? (
                product ? 'Save Changes' : 'Add Product'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
