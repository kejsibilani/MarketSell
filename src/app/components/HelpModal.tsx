import { useState } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  faqItems?: FAQItem[];
}

const defaultFAQ: FAQItem[] = [
  {
    question: 'How do I create a new company?',
    answer: 'Click the "New Company" button in the Companies table. Fill in the required information such as company name, type, status, and address. Click Create to save.',
    category: 'Getting Started',
  },
  {
    question: 'How can I manage inventory?',
    answer: 'Navigate to the Inventory Management section. You can view current stock levels, update quantities, and manage warehouse locations. Use filters to find specific products.',
    category: 'Inventory',
  },
  {
    question: 'How do I track shipments?',
    answer: 'Go to the Shipments tab to view all active and historical shipments. You can filter by status, carrier, or date range. Click on a shipment to view detailed tracking information.',
    category: 'Shipping',
  },
  {
    question: 'What does the status indicator mean?',
    answer: 'Status indicators show the current state: Green (Active), Yellow (Pending), Red (Completed/Cancelled). Hover over the status for more details.',
    category: 'Understanding the Interface',
  },
  {
    question: 'How do I export data?',
    answer: 'Select the rows you want to export using the checkboxes, then click the Export button. Choose your preferred format (CSV, Excel, PDF).',
    category: 'Data Management',
  },
  {
    question: 'Can I bulk edit records?',
    answer: 'Yes! Select multiple records using the checkboxes, then click Bulk Actions. Choose the action you want to apply to all selected items.',
    category: 'Advanced Features',
  },
];

export function HelpModal({ isOpen, onClose, title = 'Help & Documentation', faqItems = defaultFAQ }: HelpModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = Array.from(new Set(faqItems.map(item => item.category)));
  
  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle size={20}/>
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-2 mt-6">
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.question}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    </div>
                    {expandedIndex === index ? (
                      <ChevronUp size={20} className="text-gray-400 flex-shrink-0"/>
                    ) : (
                      <ChevronDown size={20} className="text-gray-400 flex-shrink-0"/>
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try different search terms or categories</p>
              </div>
            )}
          </div>

          {/* Resources Section */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Helpful Resources</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ExternalLink size={16}/>
                View Documentation
              </a>
              <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ExternalLink size={16}/>
                Video Tutorials
              </a>
              <a href="#" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ExternalLink size={16}/>
                Contact Support
              </a>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
