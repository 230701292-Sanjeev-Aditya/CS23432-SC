
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Student } from '@/types';
import { Plus } from 'lucide-react';
import { validateStudent } from '@/utils/validation';
import { toast } from '@/components/ui/use-toast';

type AddStudentFormProps = {
  onAddStudent: (student: Student) => void;
  student?: Student;
  mode?: 'add' | 'edit';
};

const emptyStudent: Student = {
  id: '',
  name: '',
  email: '',
  grade: '',
  course: ''
};

const AddStudentForm = ({ onAddStudent, student = emptyStudent, mode = 'add' }: AddStudentFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Student>({ ...student });

  const resetForm = () => {
    setFormData(mode === 'edit' ? { ...student } : { ...emptyStudent, id: crypto.randomUUID() });
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      resetForm();
    }
    setOpen(isOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure ID is set for new students
    if (!formData.id) {
      formData.id = crypto.randomUUID();
    }
    
    // Validate the student data
    const errors = validateStudent(formData, 0);
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0].message.replace(/Row \d+: /, ''),
        variant: "destructive"
      });
      return;
    }
    
    onAddStudent(formData);
    toast({
      title: mode === 'add' ? 'Student Added' : 'Student Updated',
      description: `Successfully ${mode === 'add' ? 'added' : 'updated'} ${formData.name}`
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {mode === 'add' ? (
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Student
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Student' : 'Edit Student'}</DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter the details of the new student below.'
              : 'Update the student information below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter student email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="Enter grade (e.g. A, B+, 95)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Enter course name"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{mode === 'add' ? 'Add Student' : 'Update'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentForm;
