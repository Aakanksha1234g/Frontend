import React, { useReducer, useState, useEffect } from 'react';
import { apiRequest } from '@shared/utils/api-client';

import Input from '@shared/ui/input';

const initialState = {
  formData: {
    script_title: '',
    file: null,
    upload_file_path: '',
    upload_file_name: '',
  },
  uiState: {
    fileErrors: [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case 'UPDATE_UI_STATE':
      return {
        ...state,
        uiState: { ...state.uiState, ...action.payload },
      };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

export default function ScriptDetailEdit({ data }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    formData: data
      ? { ...initialState.formData, ...data }
      : initialState.formData,
  });

  const { formData, uiState } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScriptEdit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataX = new FormData();
      if (formData?.script_title !== data?.script_title) {
        formDataX.append('script_title', formData.script_title);
      }

      if (formData.file) {
        formDataX.append('upload_file', formData.file);

        formDataX.append('upload_file_name', formData.file.name);
      }
      await apiRequest({
        endpoint: `/script_processing/edit_script/${data?.script_id}`,
        method: 'PUT',
        body: formDataX,
        headers: {
          'Content-Type': undefined,
        },
        successMessage: 'Script updated successfully',
        refreshPage: true,
      });
      // Show success message
    } catch (error) {
      // Show error message to user
      console.error('Failed to update script:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileUpload = async file => {
    try {
      if (!file.name.match(/\.(doc|docx|pdf)$/i)) {
        throw new Error('Only .doc, .docx, or .pdf files are supported');
      }
      if (file.size > 25 * 1024 * 1024) {
        throw new Error('File size exceeds 25MB limit');
      }

      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          file,
          upload_file_path: URL.createObjectURL(file),
          upload_file_name: file.name,
        },
      });

      dispatch({
        type: 'UPDATE_UI_STATE',
        payload: { fileErrors: scenes.errors },
      });
    } catch (error) {
      alert(error.message);
      dispatch({
        type: 'UPDATE_UI_STATE',
        payload: { fileErrors: [error.message] },
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.script_title.trim()) {
      errors.script_title = 'Script title is required';
    }

    return errors;
  };

  useEffect(() => {
    return () => {
      if (formData.upload_file_path) {
        URL.revokeObjectURL(formData.upload_file_path);
      }
    };
  }, [formData.upload_file_path]);

  return (
    <div className=" overflow-y-auto flex flex-col gap-2 w-full   h-full ">
      <form className="w-full flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className=" text-sm font-normal leading-[normal]">
            Script Title
          </label>
          <Input
            value={formData.script_title}
            onChange={e =>
              dispatch({
                type: 'SET_FIELD',
                field: 'script_title',
                value: e.target.value,
              })
            }
            className=" [background:var(--30,#ECF2FF)] p-2.5 rounded-lg "
          />
        </div>

        <hr className="h-[2px] bg-blue-500 w-full" />
        <div className="border-2 border-dashed border-blue-200 rounded-xl p-4 text-center bg-blue-50">
          <input
            type="file"
            name="file"
            onChange={e => {
              const file = e.target.files[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
            id="fileInput"
            accept=".doc,.docx,.pdf"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="p-2 bg-white rounded-full shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            {formData.file ? (
              <div className="text-center">
                <p className="font-medium text-gray-700">
                  {formData.upload_file_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Click to change file
                </p>
              </div>
            ) : (
              <>
                <p className="font-medium text-gray-700">
                  Drag & drop script file or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: DOC/DOCX (Max 5MB)
                </p>
              </>
            )}
          </label>
          {uiState.fileErrors.length > 0 && (
            <div className="bg-yellow-50 p-2 rounded-lg mt-2 text-left">
              {uiState.fileErrors.map((error, i) => (
                <p key={i} className="text-yellow-800 text-sm">
                  ⚠️ {error}
                </p>
              ))}
            </div>
          )}
        </div>
      </form>
      {(() => {
        const hasChanges =
          (formData?.script_title || '').trim() !==
            (data?.script_title || '').trim() ||
          formData?.upload_file_name !== data?.upload_file_name ||
          formData?.upload_file_path !== data?.upload_file_path;

        const isValid =
          formData?.script_title?.trim() && uiState.fileErrors.length === 0;

        if (!hasChanges) {
          return <p className="text-gray-500 text-sm">No changes to save</p>;
        }

        if (!isValid) {
          return (
            <div className="text-red-500 text-sm">
              {!formData?.script_title?.trim() && (
                <p>Script title is required</p>
              )}

              {uiState.fileErrors.length > 0 && <p>Please fix file errors</p>}
            </div>
          );
        }

        return (
          <button
            onClick={e => {
              if (formData.file) {
                // Show confirmation for file changes
                if (
                  window.confirm(
                    'Are you sure you want to update the script file? This may affect existing scene summaries.'
                  )
                ) {
                  handleScriptEdit(e);
                }
              } else {
                handleScriptEdit(e);
              }
            }}
            className="button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Script'}
          </button>
        );
      })()}
    </div>
  );
}
