import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  HiOutlineSearch,
  HiOutlineDotsVertical,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

export default function DataTable({
  data = [],
  columns = [],
  actions = [],
  bulkActions = [],
  filters = {},
  searchableFields = [],
  onBulkAction,
  searchPlaceholder = "Rechercher...",
  pagination = null
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sécuriser les données
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeActions = Array.isArray(actions) ? actions : [];
  const safeBulkActions = Array.isArray(bulkActions) ? bulkActions : [];

  // Filtrer les données
  const filteredData = safeData.filter(item => {
    if (!searchTerm) return true;
    
    return searchableFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Gestion de la sélection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Rendu des actions
  const renderActions = (item) => {
    if (safeActions.length === 0) return null;

    if (safeActions.length === 1) {
      const action = safeActions[0];
      const Icon = action.icon;
      
      if (action.type === 'link') {
        return (
          <Link
            href={typeof action.href === 'function' ? action.href(item) : action.href}
            className={`p-2 rounded-lg transition-colors ${action.className || 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title={action.label}
          >
            <Icon className="h-4 w-4" />
          </Link>
        );
      }
      
      return (
        <button
          onClick={() => action.onClick && action.onClick(item)}
          className={`p-2 rounded-lg transition-colors ${action.className || 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          title={action.label}
        >
          <Icon className="h-4 w-4" />
        </button>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        {safeActions.slice(0, 2).map((action, index) => {
          const Icon = action.icon;
          
          if (action.type === 'link') {
            return (
              <Link
                key={index}
                href={typeof action.href === 'function' ? action.href(item) : action.href}
                className={`p-2 rounded-lg transition-colors ${action.className || 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                title={action.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          }
          
          return (
            <button
              key={index}
              onClick={() => action.onClick && action.onClick(item)}
              className={`p-2 rounded-lg transition-colors ${action.className || 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              title={action.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        
        {safeActions.length > 2 && (
          <div className="relative group">
            <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <HiOutlineDotsVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
              {safeActions.slice(2).map((action, index) => {
                const Icon = action.icon;
                
                if (action.type === 'link') {
                  return (
                    <Link
                      key={index}
                      href={typeof action.href === 'function' ? action.href(item) : action.href}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Link>
                  );
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => action.onClick && action.onClick(item)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header avec recherche et actions bulk */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Recherche */}
          {searchableFields.length > 0 && (
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Actions en masse */}
          {selectedItems.length > 0 && safeBulkActions.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} sélectionné(s)
              </span>
              {safeBulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onBulkAction && onBulkAction(action.value, selectedItems)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    action.className || 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action.icon && <action.icon className="h-4 w-4" />}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {safeBulkActions.length > 0 && (
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {safeColumns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {safeActions.length > 0 && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td 
                  colSpan={safeColumns.length + (safeBulkActions.length > 0 ? 1 : 0) + (safeActions.length > 0 ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Aucune donnée trouvée
                </td>
              </tr>
            ) : (
              filteredData.map((item, rowIndex) => (
                <tr key={item.id || rowIndex} className="hover:bg-gray-50 transition-colors">
                  {safeBulkActions.length > 0 && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {safeColumns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {column.render ? column.render(item) : (item[column.key] || '-')}
                    </td>
                  ))}
                  {safeActions.length > 0 && (
                    <td className="px-6 py-4 text-center">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.links && pagination.links.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{pagination.from}</span> à{" "}
            <span className="font-medium">{pagination.to}</span> sur{" "}
            <span className="font-medium">{pagination.total}</span> résultats
          </div>
          
          <div className="flex items-center space-x-2">
            {pagination.links.map((link, index) => {
              if (link.label.includes('Previous')) {
                return (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`p-2 rounded-lg transition-colors ${
                      link.url 
                        ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <HiOutlineChevronLeft className="h-5 w-5" />
                  </Link>
                );
              }
              
              if (link.label.includes('Next')) {
                return (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`p-2 rounded-lg transition-colors ${
                      link.url 
                        ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <HiOutlineChevronRight className="h-5 w-5" />
                  </Link>
                );
              }
              
              return (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-blue-600 text-white"
                      : link.url
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}