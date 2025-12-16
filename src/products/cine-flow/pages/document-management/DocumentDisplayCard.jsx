import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendData } from "@api/apiMethods";
import TrashBin from "@assets/icons/TrashBin.svg";

export default function DocumentsDisplayCard({
  doc_id,
  doc_name,
  doc_description,
  doc_type_id,
  docTypes = [],
  user_name,
  created_at,
  onClose,
}) {
  const queryClient = useQueryClient();

  // 🎯 Common file handler for view & download
  const handleFileAction = async (
    doc_id,
    action,
    fallbackName = "document"
  ) => {
    try {
      const response = await fetch(
        `http://192.168.29.115:8000/get_file_doc?doc_id=${doc_id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Try to extract filename
      let filename = fallbackName;
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      if (action === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else if (action === "view") {
        window.open(url, "_blank");
      } else {
        throw new Error("Invalid action type");
      }
    } catch (error) {
      console.error(`File ${action} failed:`, error);
      alert(`Failed to ${action} the document.`);
    }
  };

  // 📥 Download mutation
  const downloadDocumentMutation = useMutation({
    mutationFn: () => handleFileAction(doc_id, "download", doc_name),
  });

  // 👁️ View mutation
  const viewDocumentMutation = useMutation({
    mutationFn: () => handleFileAction(doc_id, "view", doc_name),
  });

  // 🗑️ Delete mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (doc_id) => {
      const res = await sendData({
        endpoint: `/delete_documents/?doc_id=${doc_id}`,
        method: "POST",
        responseMessage: "Document Deleted Successfully",
      });

      if (res.status >= 200 && res.status < 300) {
        return doc_id;
      } else {
        throw new Error("Failed to delete document");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["documents"]);
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Failed to delete document:", error);
    },
  });

  // Type color mapping
  const getTypeColor = (typeId) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-purple-100 text-purple-800",
      4: "bg-orange-100 text-orange-800",
      5: "bg-red-100 text-red-800",
    };
    return colors[typeId] || "bg-gray-100 text-gray-800";
  };

  // Type name mapping
  const getTypeName = (typeId) => {
    const types = {
      1: "PDF",
      2: "Word",
      3: "Excel",
      4: "PowerPoint",
      5: "Image",
    };
    return types[typeId] || "Document";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getFileSize = () => {
    return `${Math.floor(Math.random() * 500 + 100)} KB`;
  };

  const handleDownload = () => {
    downloadDocumentMutation.mutate();
  };

  const handleDocumentClick = () => {
    viewDocumentMutation.mutate();
  };

  const onDelete = () => {
    deleteDocumentMutation.mutate(doc_id);
  };

  const currentType = docTypes.find(
    (t) => t.id === doc_type_id || t.lookup_id === doc_type_id
  );


  return (
    <div className="bg-white border border-gray-200 rounded-lg duration-200 cursor-pointer">
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          {/* File Icon */}
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>

          {/* Delete Button */}
          <button
            className="text-error-300 hover:opacity-75 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <img src={TrashBin} alt="delete icon" className="h-5 w-4" />
          </button>
        </div>

        {/* Document Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
          {doc_name}
        </h3>

        {/* Document Description */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {doc_description || "No description available"}
        </p>
      </div>

      {/* Card Content */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {/* Document Type Badge */}
          {currentType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {currentType.lookup_desc}
            </span>
          )}

          {/* Document Details */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Size: {getFileSize()}</div>
            <div>Uploaded: {formatDate(created_at)}</div>
            <div>By: {user_name || "Unknown"}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDocumentClick}
              className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Eye Icon */}
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Download Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
