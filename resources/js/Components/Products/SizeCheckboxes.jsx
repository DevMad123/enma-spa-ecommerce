import React from "react";

export default function SizeCheckboxes({ sizes, data, setData }) {
  const toggleSize = (sizeVal) => {
    if (data.size.includes(sizeVal)) {
      setData("size", data.size.filter((s) => s !== sizeVal));
    } else {
      setData("size", [...data.size, sizeVal]);
    }
  };

  return (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
            {sizes.map((size) => (
                <label key={size.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.size.includes(size.id)}
                        onChange={() => toggleSize(size.id)}
                        className="h-4 w-4 text-[#8c6c3c] border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{size.size}</span>
                </label>
            ))}
        </div>
    </div>
  )
};