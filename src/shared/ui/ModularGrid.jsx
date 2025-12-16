import { usePaginatedFetch } from '@hooks/UsePaginatedFetch';

import Loading from '@shared/ui/Loading';
import LeftIcon from '@assets/icons/left.svg';
import RightIcon from '@assets/icons/right.svg';

export default function ModularGrid({
  searchQuery,
  getProjects,
  renderItem,
  emptyMessage = 'No matching items found.',
  onDeleteItem,
  showDeletePopup,
  setShowDeletePopup,
  itemIdToDelete,
}) {
  const { baseURL, endpoint, limit, defaultParams, extractData } = getProjects;

  const { data, loading, error, pagination, setCurrentPage } =
    usePaginatedFetch({
      baseURL,
      endpoint,
      defaultParams,
      extractData,
      searchQuery,
      limit,
    });

  const handleDelete = async () => {
    try {
      await onDeleteItem(itemIdToDelete);
      setShowDeletePopup(false);
    } catch {
      // Handle error in parent
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500 text-center py-4">{error}</p>;

  return (
    <div className="flex flex-col min-h-full items-center justify-between px-4 w-full">
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">Delete Confirmation</h2>
            <p className="mb-6">Are you sure you want to delete this item?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-screen-2xl">
          {data.map(item => (
            <div key={item.id} className="flex justify-center">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-x-2 mt-4 pr-4">
          <button
            disabled={pagination.currentPage <= 1}
            onClick={() => setCurrentPage(pagination.currentPage - 1)}
            className="disabled:opacity-50 text-lg"
          >
            &lt;
          </button>

          <span className="text-lg">
            {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage(pagination.currentPage + 1)}
            className="disabled:opacity-50 text-lg"
          >
            &gt;
          </button>
          
          {pagination.totalCount > 0 && (
            <span className="text-base text-gray-600 ml-4">
              Total projects: {pagination.totalCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
