import React from "react";
import Navbar from "../components/Navbar";

// Dummy data — replace with actual API data


const Properties = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#2D3A45]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Property Statistics</h1>

        <ul className="space-y-4">
          {propertyList.map((property) => (
            <li
              key={property.id}
              className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{property.address}</p>
                  <p className="text-[#28a745] font-medium">{property.rent}</p>
                </div>
                <span
                  className={`px-4 py-1 text-sm rounded-full font-medium ${property.status === "Booked"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                    }`}
                >
                  {property.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Properties;
