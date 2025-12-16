import React, { useReducer, useState } from 'react';
import CloseIcon from '@assets/icons/close.svg';
import {
  CrossIcon,
  DownloadIcon,
  UploadIcon,
  DocIcon,
  DeleteIcon,
  TickIcon,
  MagicToolIcon,
  SparkleIcon
} from '@shared/layout/icons';
import folder from '@assets/icons/Folder.svg';
import Input from '@shared/ui/input';
import { useMutation } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';
import { useNavigate } from 'react-router';
import Button from '@shared/ui/button';
import { wordLimits, toolTipText, minWordLimits } from '@products/cine-scribe/constants/ScriptConstant';


const initialState = {
  formData: {
    title: '',
    file: null,
    errors: [],
    is_valid_format: true,
  },
  errors: {},
  apiErrors: [],
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'SET_API_ERRORS':
      return { ...state, apiErrors: action.payload };

    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };

    case 'SET_ERROR':
      // Add or remove error for a specific field
      if (action.error === null) {
        const { [action.field]: _, ...rest } = state.errors;
        return { ...state, errors: rest };
      } else {
        return {
          ...state,
          errors: {
            ...state.errors,
            [action.field]: action.error,
          },
        };
      }

    default:
      return state;
  }
}

const CreateScriptProject = ({ isOpen, onClose, onConfirm, moduleType }) => {
  if (!isOpen) return null;
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const validateField = (key, value) => {
    switch (key) {
      case 'title':
        if (!value) return 'Script Title is required';
        if (value.trim().split(/\s+/).length > 10)
          return 'Title must be at most 10 words.';
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!state.formData.title) newErrors.title = 'Script Title is required';
    if (state.formData.title.trim().split(/\s+/).length > 10)
      newErrors.title = 'Title must be at most 10 words.';

    return newErrors;
  };


  const [uploadMes, setUploadMes] = React.useState('');
  const [uploadSuccess, setUploadSuccess] = React.useState(null); // true = success, false = fail

  // After upload attempt
  const handleUploadResponse = (success, message) => {
    setUploadSuccess(success);
    setUploadMes(message);
  };

  const uploadScriptMutation = useMutation({
    mutationKey: ['uploadScript'],
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('script_title', state.formData.title);
      formData.append('module_type', moduleType);

      if (state.formData.file) {
        formData.append('upload_file', state.formData.file);
        formData.append('upload_file_name', state.formData.file.name);
      }

      return await sendData({
        endpoint: '/script_processing/upload_script',
        method: 'POST',
        body: formData,
        responseMessage: 'Project created successfully',
      });
    },

    onMutate: () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    },

    onSuccess: response => {
      dispatch({ type: 'SET_LOADING', payload: false });
  

      if (response?.data?.response?.script_id === 0) {
        handleUploadResponse(true, 'Script format is not correct');
        return;
      }

      handleUploadResponse(true, 'Upload successful');

      navigate(
        moduleType === 'SW'
          ? `/cine-scribe/script-writing/${response?.data?.response?.script_id}/input`
          : `/scene-sketch/${response?.data?.response?.script_id}/input`
      );
    },


    onError: error => {
      dispatch({ type: 'SET_LOADING', payload: false });

      console.error('Upload error:', error);

      if (error?.response?.status === 501 || error?.response?.status === 500) {
        handleUploadResponse(false, 'Server error: Please try again later');
        return;
      }

      if (error?.response?.status === 502) {
        handleUploadResponse(false, 'Bad Gateway: Please try again later');

        return;
      }
    },
  });



  async function submitData() {
    dispatch({ type: 'SET_LOADING', payload: true });
    await uploadScriptMutation.mutateAsync();
  }



  const handleClose = () => {
    // Check if form has any data entered
    const hasData = state.formData.title !== '' || state.formData.file !== null;

    if (!hasData) {
      onClose();
      return;
    }

    // if (window.confirm('Are you sure? All unsaved data will be lost.')) {
    //   dispatch({
    //     type: 'UPDATE_FORM_DATA',
    //     payload: initialState.formData,
    //   });
    //   dispatch({ type: 'SET_ERRORS', payload: {} });
    //   dispatch({ type: 'SET_API_ERRORS', payload: [] });
    onClose();
    // }
  };
  const handleFileWarningResponse = proceedWithoutFile => {
    dispatch({ type: 'SET_FILE_WARNING', payload: false });

    if (proceedWithoutFile) {
      // Create project without file
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          file: null,
        },
      });
      submitData();
    } else {
      // Clear file and ask to reupload
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          file: null,
        },
      });
    }
  };

  const handleTitleChange = e => {
    const { value } = e.target;
    dispatch({ type: 'SET_FIELD', field: 'title', value });

    // Live validation: max 10 words, required
    let errorMsg = '';
    if (!value) {
      // Don't show error while typing, only on submit/blur
      errorMsg = '';
    } else if (value.trim().split(/\s+/).length > wordLimits.title) {
      errorMsg = `Title must be at most ${wordLimits.title} words.`;
    }

    dispatch({ type: 'SET_ERROR', field: 'title', error: errorMsg || null });
  };


  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type/size
    let errorMsg = '';
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/x-celtx',
    ];
    // if (file.size > 5 * 1024 * 1024) errorMsg = 'File size must be below 5MB.';
    // Optionally check MIME types (not always accurate for extensions)
    if (!['.doc', '.docx', '.celtx', '.txt'].some(ext => file.name.endsWith(ext)))
      errorMsg = 'Unsupported format. Allowed: .doc, .docx, .celtx, .txt';

    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        file,
        upload_file_path: URL.createObjectURL(file),
        upload_file_name: file.name,
        errors: errorMsg ? [errorMsg] : [],
      },
    });

    // File error message to state if needed
    dispatch({ type: 'SET_ERROR', field: 'file', error: errorMsg || null });
  };
  const removeFile = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { file: null, upload_file_path: '', upload_file_name: '' },
    });
    dispatch({ type: 'SET_ERROR', field: 'file', error: null });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    dispatch({ type: 'SET_API_ERRORS', payload: [] });

    // Validate title and file again before submit
    const newErrors = {};
   
    if (!state.formData.title || state.formData.title.trim() === '' || state.formData.title == '')
      newErrors.title = 'Title should not be empty.';
    if (state.formData.title.trim().split(/\s+/).length > 10)
      newErrors.title = 'Title must be at most 10 words.';
    if (state.formData.errors?.length > 0)
      newErrors.file = state.formData.errors[0];


    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      return;
    }

    // Send file using mutation logic
    await uploadScriptMutation.mutateAsync();
  };




  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
      <div className="bg-[#232323] rounded-[16px] p-[32px] w-full max-w-[480px] ">
        <div className="w-full flex justify-end mb-2">
          <Button
            size="sm"
            onClick={state.loading ? null : handleClose}
            className={`bg-transparent hover:bg-[#2A2A2A] p-1  ${state.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <CrossIcon size={24} color="#A3A3A3" />
          </Button>
        </div>
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-[#262626]">
          <img src={folder} alt="Folder Icon" className="w-[40px] h-[40px]" />
          <div>
            <h2 className="text-base text-[#FCFCFC] font-semibold">
              Upload File
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Select and upload the file of your choice
            </p>
          </div>
        </div>

        {/* Script Title */}
        <div>
          {/* <label className="text-[#FCFCFC] font-medium text-sm mb-1 block">
            Script Title
          </label> */}
          <Input
            label={'Script Title'}
            type="text"
            name="title"
            value={state.formData.title}
            tooltipText={toolTipText.Title}
            onChange={handleTitleChange}
            disabled={state.loading}
            placeholder="John"
            errorMessage={state.errors.title}
            wordLimit={wordLimits.title}
            minLimit={minWordLimits.title}
            required={true}
            onBlur={e => {
              const { value } = e.target;
              setErrors(prevErrors => ({
                ...prevErrors,
                title: validateField('title', value),
              }));
            }}
          />
        </div>
        <div className=" p-1 rounded">
          <span className="text-xs text-[#FCFCFC]">
            Start by uploading a script file of supported format or manually
            enter details by clicking Create Project.
            <a
              href="/public/Lorven Script Template.docx"
              download
              className="text-[#175CD3] ml-1 mr-1 hover:underline"
            >
              Download Lorven Script Template
            </a>
            for reference.
          </span>
        </div>
        {/* Dropzone/File Upload */}
        <div className="border-2 border-dashed border-[#E5E5E5]/60 rounded-xl bg-[#1B1B1B] p-6 flex flex-col items-center text-center gap-2 my-1 ">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[#FCFCFC] font-medium">
              Click to upload the Script File
            </p>
            <p className="text-xs text-[#A3A3A3]">
              Supporting formats: .doc/.txt/.fountain/.fdx
            </p>
          </div>
          <input
            type="file"
            hidden
            disabled={state.loading}
            id="fileInput"
            onChange={handleFileChange}
            accept=".doc,.docx,.txt,.celtx"
          />

          <label
            htmlFor="fileInput"
            className={`px-3 py-2 rounded-lg font-normal flex items-center gap-2
    ${
      state.loading
        ? 'cursor-not-allowed bg-[#1a1a1a] text-[#777]'
        : 'cursor-pointer bg-[#232323] text-[#FCFCFC] hover:bg-[#262626]'
    }`}
          >
            <UploadIcon size={20} color={state.loading ? '#777' : '#A3A3A3'} />
          </label>
        </div>

        {/* Template Download Info */}
        {/* <div>
        <span className="text-xs text-[#FCFCFC]">
            Start by uploading a script file of supported format or manually
            enter details.
            </span>
        </div> */}
        {/* <div className="bg-[#1B1B1B] p-3 rounded">
          <span className="text-xs text-[#FCFCFC]">
            Start by uploading a script file of supported format or manually
            enter details.
            <a
              href="/public/Lorven Script Template.docx"
              download
              className="text-[#175CD3] ml-1 hover:underline"
            >
              Download Template
            </a>
          </span>
        </div> */}

        {/* Completed File Display */}
        {state.formData.file && (
          <div className="bg-[#262626] flex flex-col  rounded p-3  items-center gap-3">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TickIcon size={20} color="#3B7C0F" />
                <span className="text-[#FCFCFC] text-[10px]">
                  File Uploaded
                </span>
              </div>
              <Button
                type="button"
                onClick={removeFile}
                disabled={state.loading}
                className={`text-[#A3A3A3] ${state.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <DeleteIcon size={20} color="#A3A3A3" />
              </Button>
            </div>
            <hr className="w-full border-1 border-white/10" />
            <div className="w-full flex items-start justify-center gap-[10px]">
              <DocIcon size={50} />
              <div className="flex-1">
                <div className="text-[#FCFCFC]">{state.formData.file.name}</div>
                <div className="text-[#A3A3A3] text-xs ">
                  {(state.formData.file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className={`w-full bg-[#171717] p-3 text-[#FCFCFC] rounded-xl   flex items-center justify-center gap-2  ${state.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={state.loading}
        >
          <SparkleIcon size={16} color="white" className="h-4 w-4" />
          {state.loading ? 'Creating Project...' : 'Create Project'}
        </button>

        {uploadSuccess === false && uploadMes && (
          <div className="text-red-600 text-sm font-medium p-2 rounded">
            {uploadMes}
          </div>
        )}

        {uploadSuccess === true &&
          uploadMes == 'Script format is not correct' && (
            <div className="text-red-600 text-sm font-medium p-2 rounded">
              Please upload a valid script file to proceed. For your reference,
              you can
              <a
                href="/public/Lorven Script Template.docx"
                download
                className="text-blue-600 hover:underline ml-1"
              >
                download the Lorven Script Template here
              </a>
              .
            </div>
          )}
      </div>
    </div>
  );
};

export default CreateScriptProject;
