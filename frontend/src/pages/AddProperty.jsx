import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Wifi, Droplet, Zap, Shield, Home, MapPin, FileText, DollarSign, VenetianMask, Sofa, Lock, Plus, Upload, Check } from "lucide-react";

const AddProperty = () => {
  const [formData, setFormData] = useState({
    address: "",
    near:"",
    description: "",

    rent: "",
    gender: "Boys",
    furnishing: "Non-furnished",
    restriction: "Without restriction",
    images: [],
    status: "Open",
    wifi: false,
    ac: false,
    waterSupply: false,
    powerBackup: false,
    security: false,
  });

  const [imageInputs, setImageInputs] = useState([0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, index) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const fileReaders = files.map((file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    );

    Promise.all(fileReaders)
      .then((base64Images) => {
        setFormData((prev) => {
          const newImages = [...prev.images];
          newImages[index] = base64Images[0];
          return {
            ...prev,
            images: newImages,
          };
        });
      })
      .catch((err) => {
        console.error("Error reading files:", err);
      });
  };

  const handleAddImageInput = () => {
    if (imageInputs.length < 5) {
      setImageInputs((prev) => [...prev, prev.length]);
    }
  };

  const handleRemoveImageInput = (index) => {
    if (imageInputs.length > 1) {
      setImageInputs((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => {
        const newImages = [...prev.images];
        newImages.splice(index, 1);
        return { ...prev, images: newImages };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    const token = localStorage.getItem("token");

    try {
     const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;    
      const res = await fetch(`${apiBaseUrl}/users/add-property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        setFormData({
          address: "",
          description: "",
          near:"",
          rent: "",
          gender: "Boys",
          furnishing: "Non-furnished",
          restriction: "Without restriction",
          images: [],
          status: "Open",
          wifi: false,
          ac: false,
          waterSupply: false,
          powerBackup: false,
          security: false,
        });
        setImageInputs([0]);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          <div className=" mt-6 text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
              <Home className="w-8 h-8 mr-2 text-indigo-600" />
              List Your Property
            </h2>
            <p className="text-gray-600">Fill in the details to add your property to our platform</p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Property added successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Details Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-indigo-600" />
                Property Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="House No. , Building Name , Society"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Near by landmark
                  </label>
                  <input
                    type="text"
                    name="near"
                    placeholder="Eg: Golden Chwokdi , Vrindavan chowkdi"
                    value={formData.near}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Rent (₹)
                  </label>
                  <input
                    type="number"
                    name="rent"
                    placeholder="Monthly rent amount"
                    value={formData.rent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <VenetianMask className="w-4 h-4 mr-1" />
                    Preferred Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Sofa className="w-4 h-4 mr-1" />
                    Furnishing
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Non-furnished">Non-furnished</option>
                    <option value="Semi-furnished">Semi-furnished</option>
                    <option value="Fully-furnished">Fully-furnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Restrictions
                  </label>
                  <select
                    name="restriction"
                    value={formData.restriction}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Without restriction">Without restriction</option>
                    <option value="With restriction">With restriction</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your property in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                  required
                />
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    <Wifi className="w-4 h-4 mr-1" />
                    WiFi
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="ac"
                    checked={formData.ac}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    <Wifi className="w-4 h-4 mr-1" />
                    AC
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="waterSupply"
                    checked={formData.waterSupply}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    <Droplet className="w-4 h-4 mr-1" />
                    Water Supply
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="powerBackup"
                    checked={formData.powerBackup}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Power Backup
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="security"
                    checked={formData.security}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Security
                  </span>
                </label>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Property Images</h3>
              <div className="space-y-4">
                {imageInputs.map((inputIndex) => (
                  <div key={inputIndex} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image {inputIndex + 1}
                      </label>
                      <div className="flex items-center">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500">
                            <Upload className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="text-sm">
                              {formData.images[inputIndex] ? "Change Image" : "Upload Image"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, inputIndex)}
                              className="hidden"
                            />
                          </div>
                        </label>
                        {imageInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImageInput(inputIndex)}
                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {formData.images[inputIndex] && (
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={formData.images[inputIndex]}
                          alt={`Preview ${inputIndex}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
                {imageInputs.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddImageInput}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Image
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-2">Maximum 5 images allowed</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } transition-colors duration-200 flex items-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Property"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;