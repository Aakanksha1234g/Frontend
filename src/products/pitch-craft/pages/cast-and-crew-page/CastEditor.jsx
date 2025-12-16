import { useState, useRef } from 'react';
import Button from '@ui/Button';
import Input from '@ui/Input';
import Dropdown from '@ui/Dropdown';
import DropdownItem from '@ui/DropdownItem';
import {
  placeholderTexts,
  toolTipText,
  validateField,
} from "../../constants/pitch-craft-constants";
import { useSlideActions } from '@products/pitch-craft/hooks';

export default function CastEditor({ onSave, onCancel, initialCasts = [] }) {
  const [casts, setCasts] = useState(initialCasts);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [form, setForm] = useState({
    characterName: '',
    actorName: '',
    role: '',
    gender: '',
    height: '',
    weight: '',
    age: '',
    description: '',
    imageUrl: '',
  });
  const { addCastSlide, deleteSlide, switchSlide } = useSlideActions();
  const fileRef = useRef(null);

  const resetForm = () => {
    setForm({
      characterName: '',
      actorName: '',
      role: '',
      gender: '',
      height: '',
      weight: '',
      age: '',
      description: '',
      imageUrl: '',
    });
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleAddCast = () => {
  const newCast = {
    id: casts.length ? Math.max(...casts.map(c => Number(c.id || 0))) + 1 : 1,
    slide_id: casts.length ? Math.max(...casts.map(c => Number(c.slide_id || 0))) + 1 : 1,
    character_name: '',
    actor_name: '',
    role: '',
    gender: '',
    height: '',
    weight: '',
    age: '',
    description: '',
    imageUrl: '',
  };
  setCasts(prev => [...prev, newCast]);
  setSelectedId(newCast.id);
  setForm(newCast);
  setIsEditMode(true);
};


  const handleRemoveCast = (id) => {
    setCasts((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      resetForm();
    }
  };

  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateForm({ imageUrl: url });
  };

  const onRemoveImage = () => {
    try {
      if (form.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(form.imageUrl);
    } catch { }
    updateForm({ imageUrl: '' });
  };

  const handleGenderSelect = (value) => { updateForm({ gender: value }); validateAndSetError("gender", value); setIsGenderOpen(false); };

  const handleSave = () => {
    if (!form.character_name || !form.actor_name) return;

    if (isEditMode && selectedId) {
      // update existing cast
      setCasts(prev =>
        prev.map(cast =>
          cast.id === selectedId ? { ...cast, ...form, slide_id: cast.slide_id } : cast
        )
      );
      resetForm();
    } else {
      // add new cast
      const newCast = {
        id: casts.length ? Math.max(...casts.map(c => Number(c.id?.split('-')[1] || 0))) + 1 : 1,
        slide_id: casts.length ? Math.max(...casts.map(c => Number(c.slide_id || 0))) + 1 : 1,
        ...form,
      };
      setCasts(prev => [...prev, newCast]);
      setSelectedId(newCast.id);
      setIsEditMode(true);
    }
  };


  const handleSaveAll = () => {
    onSave(casts);
    // if (onCancel) onCancel(); 
  };

  const onSelectCast = (id) => {
    setSelectedId(id);
    setIsEditMode(true);
    const cast = casts.find((c) => c.id === id);
    if (cast) setForm({ ...cast });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-[96vw] sm:max-w-[94vw] lg:w-[1150px] text-white mx-auto bg-gradient-to-b from-[#333333] to-[#717171] p-[1px] rounded-[25px]"
        style={{ fontFamily: "Outfit", fontWeight: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full bg-black rounded-[25px] p-4 relative">
          {/* Left Sidebar */}
          <LeftSidebar
            items={casts}
            selectedId={selectedId}
            onAdd={handleAddCast}
            onRemove={handleRemoveCast}
            onSelect={onSelectCast}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_392px] gap-4">
            {/* Form Section */}
            <div className="flex flex-col gap-3 ml-[270px]">
              {/* Character Name */}
              <Input
                label="Character Name"
                name="character_name"
                placeholder={placeholderTexts.character_name}
                value={form.character_name}
                onChange={(e) => {
                  updateForm({ character_name: e.target.value });
                  if (errors.character_name)
                    validateAndSetError("character_name", e.target.value);
                }}
                onBlur={(e) =>
                  validateAndSetError("character_name", e.target.value)
                }
                helperText={toolTipText.character_name}
                error={errors.character_name}
              />

              {/* Actor Name */}
              <Input
                label="Actor/Actress Name"
                name="actor_name"
                placeholder={placeholderTexts.actor_name}
                value={form.actor_name}
                onChange={(e) => {
                  updateForm({ actor_name: e.target.value });
                  if (errors.actor_name)
                    validateAndSetError("actor_name", e.target.value);
                }}
                onBlur={(e) =>
                  validateAndSetError("actor_name", e.target.value)
                }
                helperText={toolTipText.actor_name}
                error={errors.actor_name}
              />

              {/* Role + Gender */}
              <div className="w-[420px] grid grid-cols-2 gap-3">
                <Input
                  label="Role"
                  name="role"
                  placeholder={placeholderTexts.role}
                  value={form.role}
                  onChange={(e) => {
                    updateForm({ role: e.target.value });
                    if (errors.role)
                      validateAndSetError("role", e.target.value);
                  }}
                  onBlur={(e) => validateAndSetError("role", e.target.value)}
                  helperText={toolTipText.role}
                  error={errors.role}
                />

                {/* Gender Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-white">
                    Gender
                  </label>
                  <Dropdown
                    isOpen={isGenderOpen}
                    onClose={() => setIsGenderOpen(false)}
                    trigger={
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-between text-left"
                        onClick={() => setIsGenderOpen((p) => !p)}
                        onBlur={() => validateAndSetError("gender", form.gender)}
                      >
                        <span className="text-xs">
                          {form.gender || "Select gender"}
                        </span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                      </Button>
                    }
                    position="left"
                    className="w-full"
                  >
                    {["Male", "Female", "Others"].map((gender) => (
                      <DropdownItem
                        key={gender}
                        onClick={() => handleGenderSelect(gender)}
                      >
                        {gender}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                  {errors.gender && (
                    <p className="text-xs text-red-400 mt-0.5 font-[Outfit]">
                      {errors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Height + Weight */}
              <div className="w-[420px] grid grid-cols-2 gap-3">
                <Input
                  label="Height"
                  name="height"
                  placeholder={placeholderTexts.height}
                  value={form.height}
                  onChange={(e) => {
                    updateForm({ height: e.target.value });
                    if (errors.height)
                      validateAndSetError("height", e.target.value);
                  }}
                  onBlur={(e) => validateAndSetError("height", e.target.value)}
                  helperText={toolTipText.height}
                  error={errors.height}
                />
                <Input
                  label="Weight"
                  name="weight"
                  placeholder={placeholderTexts.weight}
                  value={form.weight}
                  onChange={(e) => {
                    updateForm({ weight: e.target.value });
                    if (errors.weight)
                      validateAndSetError("weight", e.target.value);
                  }}
                  onBlur={(e) => validateAndSetError("weight", e.target.value)}
                  helperText={toolTipText.weight}
                  error={errors.weight}
                />
              </div>

              {/* Age */}
              <Input
                label="Age"
                name="age"
                placeholder={placeholderTexts.age}
                value={form.age}
                onChange={(e) => {
                  updateForm({ age: e.target.value });
                  if (errors.age)
                    validateAndSetError("age", e.target.value);
                }}
                onBlur={(e) => validateAndSetError("age", e.target.value)}
                helperText={toolTipText.age}
                error={errors.age}
              />

              {/* Description */}
              <Input
                label="Character Description"
                name="description"
                as="textarea"
                rows={4}
                placeholder={placeholderTexts.character_description}
                value={form.description}
                onChange={(e) => {
                  updateForm({ description: e.target.value });
                  if (errors.description)
                    validateAndSetError("description", e.target.value);
                }}
                onBlur={(e) =>
                  validateAndSetError("description", e.target.value)
                }
                helperText={toolTipText.character_description}
                error={errors.description}
                className="py-2.5"
              />

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleSave}
                  variant="primary"
                  size="md"
                  className="px-3"
                >
                  {isEditMode ? "Update" : "Add"}
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={casts.length === 0}
                  variant={casts.length === 0 ? "secondary" : "primary"}
                  size="md"
                  className="px-3"
                >
                  Save All
                </Button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex justify-end">
              <div className="w-[392px] h-[580px] rounded-[25px] overflow-hidden border border-[#2F2F2F] bg-[#0B0B0B] p-2">
                <div className="relative w-full h-full rounded-[23px] bg-[#111] flex items-center justify-center overflow-hidden">
                  {form.imageUrl ? (
                    <>
                      <img
                        src={form.imageUrl}
                        alt="preview"
                        className="w-full h-full object-contain rounded-[23px]"
                      />
                      <button
                        onClick={onRemoveImage}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-white/20"
                      >
                        <span className="relative block w-3 h-3">
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-full bg-current rotate-45"></span>
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-full bg-current -rotate-45"></span>
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="mb-3 text-sm text-[#A1A1A1]">
                        Upload Image
                      </div>
                      <label className="px-4 py-2 rounded-md bg-[#1F1F1F] hover:dark:bg-dark-accent-hover hover:bg-light-accent-soft_hover cursor-pointer inline-block">
                        <span className="text-sm">Choose file</span>
                        <input
                          ref={fileRef}
                          onChange={onImageChange}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Left Sidebar

function LeftSidebar({ items, selectedId, onAdd, onRemove, onSelect }) {
  return (
    <div className="absolute top-4 left-4 w-[260px] pr-2 overflow-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-center">Add Cast & Crew</h1>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`w-full h-10 rounded-xl px-4 flex items-center justify-between shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] border cursor-pointer ${selectedId === item.id
                ? "bg-[#141414] border-blue-500/60"
                : "bg-[#0d0d0d] border-[#2F2F2F]"
              } text-[13px] text-gray-200`}
            onClick={() => onSelect(item.id)}
          >
            <span>
              {item.actor_name && item.actor_name.trim().length > 0
                ? item.actor_name
                : `Cast ${idx + 1}`}
            </span>
            <button
              aria-label="Delete cast"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="p-1 rounded hover:text-red-400 hover:bg-[#1a1a1a] transition text-gray-400"
            >
              <span className="relative block w-3 h-3">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 block h-0.5 w-full bg-current rotate-45"></span>
                <span className="absolute left-0 top-1/2 -translate-y-1/2 block h-0.5 w-full bg-current -rotate-45"></span>
              </span>
            </button>
          </div>
        ))}

        {/* <button
          onClick={onAdd}
          className="w-full h-10 rounded-xl bg-[#1a1a1a] border border-dashed border-[#555] hover:bg-[#222] hover:border-[#888] text-gray-400 hover:text-white flex items-center justify-center text-sm transition-all"
        >
          + Add New Cast
        </button> */}
      </div>
    </div>
  );
}