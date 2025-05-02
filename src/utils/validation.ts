
import { Student, ValidationError } from '@/types';

export const validateStudent = (student: Student, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!student.name) {
    errors.push({
      row: rowIndex,
      field: 'name',
      message: `Row ${rowIndex}: Name is required`
    });
  }

  // Email validation
  if (!student.email) {
    errors.push({
      row: rowIndex,
      field: 'email',
      message: `Row ${rowIndex}: Email is required`
    });
  } else if (!isValidEmail(student.email)) {
    errors.push({
      row: rowIndex,
      field: 'email',
      message: `Row ${rowIndex}: Invalid email format`
    });
  }

  // Grade validation (assuming grades are A, B, C, D, F or numeric values)
  if (student.grade && !isValidGrade(student.grade)) {
    errors.push({
      row: rowIndex,
      field: 'grade',
      message: `Row ${rowIndex}: Invalid grade format`
    });
  }

  // Course validation
  if (!student.course) {
    errors.push({
      row: rowIndex,
      field: 'course',
      message: `Row ${rowIndex}: Course is required`
    });
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidGrade = (grade: string): boolean => {
  // Accept letter grades (A, B, C, D, F) with optional + or -
  // Or numeric grades (0-100)
  const letterGradeRegex = /^[A-F][+-]?$/;
  const numericGradeRegex = /^(100|[0-9]{1,2})$/;
  
  return letterGradeRegex.test(grade) || numericGradeRegex.test(grade);
};
