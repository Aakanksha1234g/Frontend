import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendData } from "@api/apiMethods";

export default function DocumentDetailedCard({ document, onClose }) {
  const queryClient = useQueryClient();

  const getTypeColor = (type) => {
    const colors = {
      NDA: "bg-red-100 text-red-800",
      Contract: "bg-blue-100 text-blue-800",
      Insurance: "bg-green-100 text-green-800",
      Agreement: "bg-purple-100 text-purple-800",
      Others: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors["Others"];
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await sendData({
        endpoint: `/delete_document/${document?.id || document?.doc_id}`,
        method: "DELETE",
        responseMessage: "Document deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["documents"]);
      onClose(); // Close modal after deletion
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">{document?.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2 py-1 rounded ${getTypeColor(document?.type)}`}
              >
                {document?.type}
              </span>
              <span className="text-sm text-gray-500">
                {document?.size} • {document?.uploadDate} • By{" "}
                {document?.uploadedBy}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(document?.fileUrl, "_blank")}
              className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              ⬇️ Download
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-sm px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
            >
              🗑️ {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-600">{document?.description}</p>
          </div>

          <div className="border rounded-lg bg-white min-h-[600px] overflow-hidden">
            {document?.fileType === "application/pdf" ||
            document?.name?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={document?.fileUrl}
                className="w-full h-[600px] border-0"
                title={`Preview of ${document?.name}`}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-gray-50">
                <div className="text-center space-y-4">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {document?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Preview not available for this file type
                    </p>
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => window.open(document?.fileUrl, "_blank")}
                    >
                      ⬇️ Download to View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
