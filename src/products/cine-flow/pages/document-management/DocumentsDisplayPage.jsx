import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@api/apiMethods";
import DocumentsDisplayCard from "./DocumentDisplayCard";
import UploadDocumentModal from "./UploadDocumentModal";

export default function DocumentsDisplayPage() {
  const queryClient = useQueryClient();

  const [searchDocument, setSearchDocument] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchDocument);
  const [showDropdown, setShowDropdown] = useState(false);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [documentType, setDocumentType] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Debounce searchDocument input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchDocument);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchDocument]);

  const { data, isPending, error } = useQuery({
    queryKey: ["documents", debouncedSearch],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/get_all_documents/1`,
        method: "GET",
        params: {
          project_id: 1,
          search: debouncedSearch || "",
          page: 1,
        },
      });
      console.log("Documents API Response:", response.data);
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Process doc_types when data is received
  useEffect(() => {
    if (data?.doc_types) {
      let flatTypes = [];

      // Handle nested array structure: doc_types[0][0] or direct array
      if (
        Array.isArray(data.doc_types) &&
        data.doc_types[0] &&
        Array.isArray(data.doc_types[0][0])
      ) {
        flatTypes = data.doc_types[0][0];
      } else if (Array.isArray(data.doc_types[0])) {
        flatTypes = data.doc_types[0];
      } else if (Array.isArray(data.doc_types)) {
        flatTypes = data.doc_types;
      }

      // Ensure consistent structure for dropdown
      const normalizedTypes = flatTypes.map((item) => ({
        id: item.lookup_id || item.id,
        name: item.lookup_desc || item.name || item.description,
        lookup_id: item.lookup_id || item.id,
        lookup_desc: item.lookup_desc || item.name || item.description,
      }));

      setDocumentTypeList(normalizedTypes);
    }
  }, [data]);

  // Filter documents based on selected document type
  const filteredDocuments = useMemo(() => {
    if (!data?.response || !Array.isArray(data.response)) {
      return [];
    }

    if (!documentType) {
      return data.response; // Show all documents if no type selected
    }

    return data.response.filter((doc) => {
      // Match doc_type_id with selected documentType
      return (
        doc.doc_type_id === documentType ||
        doc.doc_type_id === String(documentType) ||
        String(doc.doc_type_id) === String(documentType)
      );
    });
  }, [data?.response, documentType]);

  const handleTypeSelect = (typeId) => {
    setDocumentType(typeId);
    setShowDropdown(false);
  };

  // Get selected type display name
  const getSelectedTypeName = () => {
    if (!documentType) return "Document Type";
    const selectedType = documentTypeList.find(
      (type) => type.lookup_id === documentType || type.id === documentType
    );
    return selectedType?.lookup_desc || selectedType?.name || "Document Type";
  };

  return (
    <div className="h-full w-full p-6 bg-white">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-600 mb-4">
          Upload, organize, and manage your documents securely
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 relative">
        <input
          type="text"
          onChange={(e) => setSearchDocument(e.target.value)}
          value={searchDocument}
          placeholder="Search documents..."
          className="w-4/6 p-2 flex-1 border border-gray-300 rounded"
        />

        {/* Dropdown toggle */}
        <button
          id="dropdownDefaultButton"
          onClick={() => setShowDropdown((prev) => !prev)}
          className="text-black border border-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
          type="button"
        >
          {getSelectedTypeName()}
          <svg
            className="w-2.5 h-2.5 ml-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div
            id="dropdown"
            className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 absolute top-14 right-40"
          >
            <ul className="py-2 text-sm text-gray-700">
              <li key="all">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleTypeSelect(null)}
                >
                  All Types
                </button>
              </li>
              {documentTypeList.map((type) => (
                <li key={type.id || type.lookup_id}>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTypeSelect(type.id || type.lookup_id)}
                  >
                    {type.name || type.lookup_desc}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Document
        </button>

        {showUploadModal && (
          <UploadDocumentModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries(["documents"]);
              setShowUploadModal(false);
            }}
            docTypes={documentTypeList}
          />
        )}
      </div>

      {/* Loading / Error / Result UI */}
      <div className="mt-6">
        {isPending && <p>Loading documents...</p>}
        {error && <p className="text-red-500">Error loading documents.</p>}

        <ul className="mt-4 space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.length > 0
            ? filteredDocuments.map((doc) => (
                <DocumentsDisplayCard
                  key={doc.doc_id}
                  doc_id={doc.doc_id}
                  doc_name={doc.doc_name}
                  doc_description={doc.doc_description}
                  doc_type_id={doc.doc_type_id}
                  docTypes={documentTypeList}
                  user_name={doc.user_name}
                  created_at={doc.created_at}
                  onClose={() => setShowDropdown(false)}
                />
              ))
            : !isPending && (
                <p>
                  No documents found
                  {documentType ? " for the selected type" : ""}.
                </p>
              )}
        </ul>
      </div>
    </div>
  );
}
