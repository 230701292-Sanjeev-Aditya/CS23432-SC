
import { Student, ValidationError } from '@/types';
import { validateStudent } from './validation';

export const parseCSV = (content: string): { data: Student[], errors: ValidationError[] } => {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  
  const requiredFields = ['name', 'email', 'grade', 'course'];
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    return {
      data: [],
      errors: [{
        row: 0,
        field: missingFields.join(', '),
        message: `Missing required field(s): ${missingFields.join(', ')}`
      }]
    };
  }

  const data: Student[] = [];
  const errors: ValidationError[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length !== headers.length) {
      errors.push({
        row: i,
        field: 'format',
        message: `Row ${i} has ${values.length} values, expected ${headers.length}`
      });
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    const student: Student = {
      id: crypto.randomUUID(),
      name: row.name || '',
      email: row.email || '',
      grade: row.grade || '',
      course: row.course || ''
    };

    const validationErrors = validateStudent(student, i);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
    } else {
      data.push(student);
    }
  }

  return { data, errors };
};
