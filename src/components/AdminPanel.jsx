import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage, compressImage } from '../utils/imageUpload';
import { X, Plus, Tag, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    imageUrl: '',
    rating: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [existingItems, setExistingItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadExistingItems();
  }, [activeTab]);

  const loadExistingItems = async () => {
    setLoadingItems(true);
    try {
      const collectionName = activeTab === 'products' ? 'products' : 'offers';
      const querySnapshot = await getDocs(collection(db, collectionName));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExistingItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB.');
      return;
    }

    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      setImageFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setMessage('Error processing image. Please try another file.');
      console.error('Image processing error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setUploadProgress(0);

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        setUploadProgress(25);
        imageUrl = await uploadImage(imageFile, activeTab);
        setUploadProgress(50);
      }

      const collectionName = activeTab === 'products' ? 'products' : 'offers';
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category.trim() || 'General',
        stock: parseInt(formData.stock) || 0,
        imageUrl: imageUrl || '',
        rating: parseFloat(formData.rating) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (activeTab === 'offers') {
        data.originalPrice = parseFloat(formData.originalPrice) || null;
        data.active = true;
      }

      setUploadProgress(75);
      await addDoc(collection(db, collectionName), data);
      setUploadProgress(100);

      // Track with Analytics
      if (window.gtag) {
        window.gtag('event', 'add_item', {
          item_type: activeTab === 'products' ? 'product' : 'offer',
          item_name: data.name
        });
      }

      setMessage(`✓ ${activeTab === 'products' ? 'Product' : 'Offer'} added successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        stock: '',
        imageUrl: '',
        rating: ''
      });
      setImageFile(null);
      setImagePreview('');
      
      // Reload items
      loadExistingItems();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
      console.error('Error adding document:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const collectionName = activeTab === 'products' ? 'products' : 'offers';
      await deleteDoc(doc(db, collectionName, itemId));
      setMessage('✓ Item deleted successfully!');
      loadExistingItems();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`✗ Error deleting item: ${error.message}`);
      console.error('Error deleting document:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl my-8">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Selection */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => {
                setActiveTab('products');
                setMessage('');
              }}
              className={`pb-3 px-4 font-medium transition-all ${
                activeTab === 'products'
                  ? 'border-b-3 border-yellow-500 text-yellow-600'
                  : 'text-gray-600 hover:text-yellow-600'
              }`}
            >
              <Plus size={18} className="inline mr-2" />
              Add Product
            </button>
            <button
              onClick={() => {
                setActiveTab('offers');
                setMessage('');
              }}
              className={`pb-3 px-4 font-medium transition-all ${
                activeTab === 'offers'
                  ? 'border-b-3 border-red-500 text-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Tag size={18} className="inline mr-2" />
              Add Offer
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                {activeTab === 'products' ? 'New Product' : 'New Offer'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Cordless Drill Set"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    placeholder="Detailed product description..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {activeTab === 'offers' && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Original Price
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="99.99"
                      />
                    </div>
                  )}
                  
                  <div className={activeTab === 'offers' ? '' : 'col-span-2'}>
                    <label className="block text-gray-700 font-medium mb-2">
                      {activeTab === 'offers' ? 'Offer Price *' : 'Price *'}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="79.99"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., Power Tools"
                      list="categories"
                    />
                    <datalist id="categories">
                      <option value="Power Tools" />
                      <option value="Hand Tools" />
                      <option value="Hardware" />
                      <option value="Safety Equipment" />
                      <option value="Garden Tools" />
                      <option value="Paint & Supplies" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="4.5"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Product Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={40} className="text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF or WebP (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}

                  {/* OR Image URL */}
                  <div className="mt-4">
                    <p className="text-center text-gray-500 text-sm mb-2">OR</p>
                    <label className="block text-gray-700 font-medium mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      disabled={!!imageFile}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:bg-gray-100"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {message && (
                  <div className={`p-4 rounded-lg flex items-center gap-2 ${
                    message.includes('✗') || message.includes('Error')
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    <span className="font-bold">{message.includes('✗') ? '✗' : '✓'}</span>
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${
                    activeTab === 'products'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      {activeTab === 'products' ? <Plus size={20} /> : <Tag size={20} />}
                      Add {activeTab === 'products' ? 'Product' : 'Offer'}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Items Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Existing {activeTab === 'products' ? 'Products' : 'Offers'}
              </h3>

              {loadingItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading items...</p>
                </div>
              ) : existingItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No items found.</p>
                  <p className="text-sm text-gray-500 mt-2">Add your first item using the form.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {existingItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">🔧</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-lg font-bold text-yellow-600">
                              ${item.price?.toFixed(2)}
                            </span>
                            {item.category && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {item.category}
                              </span>
                            )}
                            {item.stock !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                Stock: {item.stock}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;