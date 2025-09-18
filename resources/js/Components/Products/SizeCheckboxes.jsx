import React from "react";

export default function SizeCheckboxes({ sizes, data, setData }) {
  const toggleSize = (sizeId) => {
    const val = String(sizeId); // Toujours stocké en string
    if (data.size.includes(val)) {
      setData("size", data.size.filter((s) => s !== val));
    } else {
      setData("size", [...data.size, val]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Tailles</label>
      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
        {sizes.map((size) => {
          const val = String(size.id);
          return (
            <label key={size.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.size.includes(val)}
                onChange={() => toggleSize(size.id)}
                className="h-4 w-4 text-[#8c6c3c] border-gray-300 rounded"
              />
              <span className="text-gray-700">{size.size}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
