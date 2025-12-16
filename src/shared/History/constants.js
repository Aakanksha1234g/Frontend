export const MAX_SELECTIONS = 3;

export const EXCLUDE_PATTERNS = [
  /_id$/, // ends with _id
  /^created_by$/, // created_by
  /^updated_by$/, // updated_by
  /^updated_at$/, // updated_at
  /^created_at$/, // created_at
  /^delete_flag$/, // delete_flag
  /^update_by$/, // update_by
  /^operation_executed_at$/, // Operation executed at
];
