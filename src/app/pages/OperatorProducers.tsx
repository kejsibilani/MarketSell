import React, { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PRODUCERS as MOCK_PRODUCERS } from '../data/mockData';
import { NewRecordModal } from '../components/NewRecordModal';
import TableHeader from '../components/TableHeader';
import { Plus, X, MapPin, Image as ImageIcon, Play, Star, FileText, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { writeCollection } from '../../lib/backend/storage';

const LS_KEY = 'marketsell_producers';

function loadProducers() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return MOCK_PRODUCERS;
}

function saveProducers(producers: any[]) {
  try {
    writeCollection(LS_KEY, producers);
  } catch (e) {}
}

function getCountryFlag(country: string) {
  const flags: { [key: string]: string } = {
    'El Salvador': '🇸🇻',
    'Colombia': '🇨🇴',
    'Brazil': '🇧🇷',
    'Costa Rica': '🇨🇷',
    'Mexico': '🇲🇽',
    'Guatemala': '🇬🇹',
    'Peru': '🇵🇪',
    'Ecuador': '🇪🇨',
  };
  return flags[country] || '🌍';
}

export default function OperatorProducers() {
  const [producers, setProducers] = useState<any[]>(() => loadProducers());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showNewProducerModal, setShowNewProducerModal] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<any>(null);
  const [editingProducer, setEditingProducer] = useState<any>(null);
  const [editingPhotos, setEditingPhotos] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [newPhotoName, setNewPhotoName] = useState('');
  const [locationCity, setLocationCity] = useState('');

  useEffect(() => {
    saveProducers(producers);
  }, [producers]);

  const filteredProducers = useMemo(() => {
    return producers.filter(p =>
      (status === 'all' || p.status === status) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.country.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, status, producers]);

  const handleAddProducer = () => {
    setEditingProducer(null);
    setShowNewProducerModal(true);
  };

  const handleEditProducer = (producer: any) => {
    setEditingProducer(producer);
    setShowNewProducerModal(true);
  };

  const handleSaveEdit = (data: any) => {
    if (editingProducer) {
      const updated = producers.map(p => p.id === editingProducer.id ? { ...editingProducer, ...data } : p);
      setProducers(updated);
    } else {
      const newProducer = {
        id: `PROD-${String(Math.max(...producers.map(p => parseInt(p.id.split('-')[1]) || 0), 0) + 1).padStart(3, '0')}`,
        name: data.name || 'New Producer',
        country: data.country || 'Unknown',
        status: 'Pending',
        contactEmail: data.contactEmail || '',
        skuCount: 0,
      };
      setProducers([...producers, newProducer]);
    }
    setShowNewProducerModal(false);
    setEditingProducer(null);
  };

  const handleDeleteProducer = (id: string) => {
    if (confirm('Are you sure you want to delete this producer?')) {
      setProducers(producers.filter(p => p.id !== id));
    }
  };

  const handleAddPhoto = () => {
    if (!newPhotoName.trim()) return;
    const updatedProducers = producers.map(p => {
      if (p.id === selectedProducer.id) {
        const photos = p.photos || [];
        const newPhoto = { id: Date.now(), name: newPhotoName, description: 'Photo' };
        return { ...p, photos: [...photos, newPhoto] };
      }
      return p;
    });
    setProducers(updatedProducers);
    const updated = updatedProducers.find(p => p.id === selectedProducer.id);
    setSelectedProducer(updated);
    setNewPhotoName('');
  };

  const handleRemovePhoto = (photoId: number) => {
    const updatedProducers = producers.map(p => {
      if (p.id === selectedProducer.id) {
        return { ...p, photos: (p.photos || []).filter((ph: any) => ph.id !== photoId) };
      }
      return p;
    });
    setProducers(updatedProducers);
    const updated = updatedProducers.find(p => p.id === selectedProducer.id);
    setSelectedProducer(updated);
  };

  const handleUpdateLocation = () => {
    if (!locationCity.trim()) return;
    const updatedProducers = producers.map(p => {
      if (p.id === selectedProducer.id) {
        return { ...p, location: locationCity, country: locationCity };
      }
      return p;
    });
    setProducers(updatedProducers);
    const updated = updatedProducers.find(p => p.id === selectedProducer.id);
    setSelectedProducer(updated);
    setEditingLocation(false);
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Producers"
          description="Manage producer profiles and their SKU listings."
          onAddNew={handleAddProducer}
          addNewLabel="New Producer"
        />

        {/* Status filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
            {['all', 'Active', 'Pending'].map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-[#0B1F3A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {s === 'all' ? 'All Statuses' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => { setSearch(''); setStatus('all'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Total Producers</div>
            <div className="text-2xl font-bold text-gray-900">{producers.length}</div>
            <div className="text-xs text-gray-500 mt-1">All registered producers</div>
          </button>
          <button onClick={() => { setSearch(''); setStatus('Active'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">{producers.filter(p => p.status === 'Active').length}</div>
            <div className="text-xs text-gray-500 mt-1">Active producers</div>
          </button>
          <button onClick={() => { setSearch(''); setStatus('Pending'); }} className="p-4 rounded-lg border border-gray-200 bg-white text-left">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{producers.filter(p => p.status === 'Pending').length}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting verification</div>
          </button>
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <div className="text-sm text-gray-600">Total SKUs</div>
            <div className="text-2xl font-bold text-amber-600">{producers.reduce((sum, p) => sum + (p.skuCount || 0), 0)}</div>
            <div className="text-xs text-gray-500 mt-1">All active product listings</div>
          </div>
        </div>

        {/* Table header + table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <TableHeader
            title="Producers"
            count={filteredProducers.length}
            query={search}
            setQuery={setSearch}
            status={status}
            setStatus={setStatus}
            statusOptions={[{ value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }]}
          />
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50">Producer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Country</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">SKU Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducers.length > 0 ? (
                    filteredProducers.map((producer, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedProducer(producer)}
                        className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 z-10 bg-white hover:bg-blue-50 font-medium">{producer.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{producer.country}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${producer.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'}`}>
                            {producer.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{producer.contactEmail}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{producer.skuCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No producers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Producer Detail Modal */}
        {selectedProducer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-green-600">{selectedProducer.name}</h2>
                  <p className="text-sm text-gray-600">Code: {selectedProducer.id}</p>
                </div>
                <button onClick={() => setSelectedProducer(null)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Header Info - Editable */}
                <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <legend className="text-sm font-bold text-gray-900 px-2 flex items-center gap-2">
                    <Edit size={16} /> Basic Information
                  </legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Producer Name</span>
                      <p className="text-gray-900 font-semibold text-sm mt-1">{selectedProducer.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Country</span>
                      <p className="text-gray-900 font-semibold text-sm mt-1 flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(selectedProducer.country)}</span> 
                        {selectedProducer.country}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Contact Email</span>
                      <p className="text-gray-600 text-sm mt-1">{selectedProducer.contactEmail}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                      <p className={`px-3 py-1 rounded text-xs font-bold w-fit mt-1 ${selectedProducer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedProducer.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditProducer(selectedProducer)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm"
                  >
                    <Edit size={16} /> Edit Information
                  </button>
                </fieldset>

                {/* Farm Location Map - Editable */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm">📍 Farm Location</h3>
                    <button
                      onClick={() => {
                        setEditingLocation(!editingLocation);
                        setLocationCity(selectedProducer.location || selectedProducer.country || '');
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                    >
                      {editingLocation ? 'Done' : 'Edit'}
                    </button>
                  </div>
                  
                  {editingLocation ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">City/Location Name</label>
                        <input
                          type="text"
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          placeholder="e.g., San Salvador, Bogotá, São Paulo"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateLocation}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Save Location
                        </button>
                        <button
                          onClick={() => setEditingLocation(false)}
                          className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Location: {selectedProducer.location || selectedProducer.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SKU Count Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-2">Products</h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">{selectedProducer.skuCount}</p>
                  <p className="text-xs text-gray-600">SKUs registered in system</p>
                </div>

                {/* Photos Section - Editable */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm">📸 Photos</h3>
                    <button
                      onClick={() => setEditingPhotos(!editingPhotos)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                    >
                      {editingPhotos ? 'Done' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedProducer.photos || [
                      { id: 1, name: 'Farm Overview', description: 'Main farm view' },
                      { id: 2, name: 'Processing Facility', description: 'Coffee processing area' },
                    ]).map((photo: any) => (
                      <div key={photo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                            <p className="text-xs text-gray-600">{photo.description}</p>
                          </div>
                        </div>
                        {editingPhotos && (
                          <button
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete photo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {editingPhotos && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Photo name (e.g., 'Farm North Wing')..."
                        value={newPhotoName}
                        onChange={(e) => setNewPhotoName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPhoto()}
                      />
                      <button
                        onClick={handleAddPhoto}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Videos Section - Read Only */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">🎥 Videos</h3>
                  <div className="space-y-2">
                    {(selectedProducer.videos || [
                      { id: 1, name: 'Farm View', description: 'Video tour of facilities' },
                      { id: 2, name: 'Harvest Process', description: 'Seasonal harvest details' },
                    ]).map((video: any) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Play className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{video.name}</p>
                          <p className="text-xs text-gray-600">{video.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold">+ Add video</button>
                </div>

                {/* Certifications/Documents - Editable */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">Documents & Certificates</h3>
                  <button className="mb-3 text-blue-600 hover:text-blue-700 text-sm font-semibold">+ Add document</button>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Document Name</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">02.06.2026</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">Sanitary certificate</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Original scan from farmer</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">02.06.2026</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Labor certificate</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Producer labour statement</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">08.05.2026</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Quality check</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Test Incalabs</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">12.05.2026</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Quality check</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">3rd party test</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600">18.04.2026</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">Sample picture</span></td>
                        <td className="px-3 py-2 text-blue-600 hover:underline cursor-pointer">Picture of current status</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button className="text-gray-400 hover:text-gray-600"><FileText size={14} /></button>
                          <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Reviews Section - Read Only */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-sm mb-3">⭐ Reviews & Ratings</h3>
                  <div className="space-y-4">
                    {(selectedProducer.reviews || [
                      { id: 1, rating: 5, comment: 'Great coffee quality and reliable delivery!' },
                      { id: 2, rating: 4, comment: 'Good products but pricing could be better' },
                      { id: 3, rating: 5, comment: 'Fantastic supplier, highly recommended!' },
                    ]).map((review: any) => (
                      <div key={review.id} className="border-l-4 border-yellow-400 pl-3 py-2 bg-yellow-50 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 font-medium">({review.rating}/5)</span>
                        </div>
                        <p className="text-xs text-gray-700">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-between border-t border-gray-200 pt-4">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 text-sm">📋 Traceability Report</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 text-sm">📊 Stock Movements</button>
                  </div>
                  <button onClick={() => setSelectedProducer(null)} className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NewRecordModal
        isOpen={showNewProducerModal}
        onClose={() => setShowNewProducerModal(false)}
        onSubmit={handleSaveEdit}
        entityType="producer"
        title={editingProducer ? 'Edit Producer' : 'New Producer'}
      />
    </>
  );
}
