
export type Student = {
  id: string;
  name: string;
  email: string;
  grade: string;
  course: string;
};

export type ValidationError = {
  row: number;
  field: string;
  message: string;
};

export type ImportStatus = {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  errors: ValidationError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
};
