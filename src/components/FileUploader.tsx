
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImportStatus, Student, ValidationError } from '@/types';
import { parseCSV } from '@/utils/csvParser';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2, File, Upload, X } from 'lucide-react';

type FileUploaderProps = {
  onImportComplete: (students: Student[]) => void;
};

const FileUploader = ({ onImportComplete }: FileUploaderProps) => {
  const [imports, setImports] = useState<ImportStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Create import status entries for each file
    const newImports = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      totalRows: 0,
      processedRows: 0,
      errors: [] as ValidationError[],
      status: 'pending' as const,
      progress: 0
    }));

    setImports(prev => [...prev, ...newImports]);

    // Process each file
    Array.from(files).forEach(async (file, index) => {
      const importId = newImports[index].id;
      
      try {
        // Update status to processing
        setImports(prev => prev.map(imp => 
          imp.id === importId ? { ...imp, status: 'processing' as const } : imp
        ));

        // Read the file content
        const content = await readFileContent(file);
        
        // Parse and validate CSV
        const { data, errors } = parseCSV(content);
        
        // Update import status based on results
        setImports(prev => prev.map(imp => {
          if (imp.id === importId) {
            const totalRows = content.split('\n').length - 1; // Exclude header row
            const status = errors.length > 0 ? 'failed' : 'completed';
            
            return {
              ...imp,
              totalRows,
              processedRows: data.length,
              errors,
              status,
              progress: 100
            };
          }
          return imp;
        }));

        // If successful, add students to the table
        if (errors.length === 0) {
          onImportComplete(data);
          toast({
            title: "Import Successful",
            description: `Successfully imported ${data.length} students from ${file.name}`,
          });
        } else {
          toast({
            title: "Import Failed",
            description: `Found ${errors.length} errors in ${file.name}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        setImports(prev => prev.map(imp => 
          imp.id === importId ? { 
            ...imp, 
            status: 'failed', 
            errors: [{
              row: 0,
              field: 'file',
              message: `Failed to process file: ${(error as Error).message}`
            }]
          } : imp
        ));
        
        toast({
          title: "Import Failed",
          description: `Error processing ${file.name}: ${(error as Error).message}`,
          variant: "destructive"
        });
      }
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const removeImport = (id: string) => {
    setImports(prev => prev.filter(imp => imp.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Students</CardTitle>
          <CardDescription>
            Upload CSV files with student data. The CSV should include columns for name, email, grade, and course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              multiple
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Select CSV Files
            </Button>
            <p className="text-sm text-muted-foreground">
              You can upload multiple files at once
            </p>
          </div>
        </CardContent>
      </Card>

      {imports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imports.map((imp) => (
                <div key={imp.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <File size={16} />
                      <span className="font-medium">{imp.fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {imp.status === 'processing' && <span className="text-sm text-blue-500">Processing...</span>}
                      {imp.status === 'completed' && <span className="text-sm text-green-500 flex items-center gap-1"><CheckCircle2 size={14} /> Completed</span>}
                      {imp.status === 'failed' && <span className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> Failed</span>}
                      <Button variant="ghost" size="sm" onClick={() => removeImport(imp.id)}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <Progress value={imp.progress} className="h-2" />
                  
                  <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                    <span>
                      {imp.processedRows} of {imp.totalRows || '?'} rows processed
                    </span>
                    <span>
                      {imp.errors.length > 0 ? `${imp.errors.length} errors found` : ''}
                    </span>
                  </div>
                  
                  {imp.errors.length > 0 && (
                    <div className="mt-2">
                      <details>
                        <summary className="text-sm text-red-500 cursor-pointer">
                          View Errors
                        </summary>
                        <div className="mt-2 bg-red-50 p-2 rounded text-sm max-h-32 overflow-y-auto">
                          <ul className="list-disc pl-5">
                            {imp.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx} className="text-red-700">
                                {error.message}
                              </li>
                            ))}
                            {imp.errors.length > 5 && (
                              <li className="text-red-700">
                                ...and {imp.errors.length - 5} more errors
                              </li>
                            )}
                          </ul>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploader;
