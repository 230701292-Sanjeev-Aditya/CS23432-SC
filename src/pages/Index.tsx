
import { useState } from 'react';
import { Student } from '@/types';
import FileUploader from '@/components/FileUploader';
import StudentTable from '@/components/StudentTable';
import SearchBar from '@/components/SearchBar';
import AddStudentForm from '@/components/AddStudentForm';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddStudent = (student: Student) => {
    setStudents(prev => {
      const existingIndex = prev.findIndex(s => s.id === student.id);
      if (existingIndex >= 0) {
        // Update existing student
        const newStudents = [...prev];
        newStudents[existingIndex] = student;
        return newStudents;
      } else {
        // Add new student
        return [...prev, student];
      }
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    toast({
      title: "Student Deleted",
      description: "The student has been successfully removed."
    });
  };

  const handleImportComplete = (importedStudents: Student[]) => {
    setStudents(prev => [...prev, ...importedStudents]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Student Data Management System</h1>
        <p className="text-muted-foreground">
          Manage student data, import CSV files, and search for specific students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FileUploader onImportComplete={handleImportComplete} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Students</h2>
            <AddStudentForm onAddStudent={handleAddStudent} />
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <StudentTable 
        students={students}
        onUpdateStudent={handleAddStudent}
        onDeleteStudent={handleDeleteStudent}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Index;
