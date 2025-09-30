'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employee-table';
import type { Employee } from '@/lib/types';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { DeleteEmployeeDialog } from '@/components/delete-employee-dialog';
import { api } from '@/lib/fetcher';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Note: The Employee type from the backend might differ from the frontend one.
// We'll cast for now, but this should be unified.
interface ApiEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  // Add other fields from the API response as needed
}

function formatEmployeeData(apiEmployee: ApiEmployee): Employee {
  return {
    id: apiEmployee._id,
    name: `${apiEmployee.firstName} ${apiEmployee.lastName}`,
    email: apiEmployee.email,
    position: { id: apiEmployee.position, name: apiEmployee.position },
    department: { id: apiEmployee.department, name: apiEmployee.department },
    status: apiEmployee.status || 'Active', // Default status if not provided
    avatarUrl: `https://picsum.photos/seed/${apiEmployee._id}/40/40`,
    imageHint: 'person face',
    role: 'EMPLOYEE', // This should likely come from the API in the future
  };
}


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api<ApiEmployee[]>('/api/employees')
      .then((data) => {
        setEmployees(data.map(formatEmployeeData));
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to fetch employees.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [toast]);

  const handleAddEmployee = async (newEmployeeData: Omit<Employee, 'id' | 'avatarUrl' | 'imageHint' | 'status' | 'role'> & {firstName: string, lastName: string}) => {
     try {
      const created = await api<ApiEmployee>('/api/employees', {
        method: 'POST',
        body: JSON.stringify({
          firstName: newEmployeeData.firstName,
          lastName: newEmployeeData.lastName,
          email: newEmployeeData.email,
          position: newEmployeeData.position.name,
          department: newEmployeeData.department.name,
        }),
      });
      setEmployees((prev) => [formatEmployeeData(created), ...prev]);
      setIsAddDialogOpen(false);
       toast({
        title: 'Success',
        description: 'Employee added successfully.',
      });
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to add employee.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedEmployee) {
      try {
        await api(`/api/employees/${selectedEmployee.id}`, { method: 'DELETE' });
        setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id));
        setSelectedEmployee(null);
        setIsDeleteDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Employee deleted successfully.',
        });
      } catch (error) {
         toast({
          title: 'Error',
          description: 'Failed to delete employee.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>
                Manage your organization&apos;s employees.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <EmployeeTable employees={employees} onDeleteClick={handleDeleteClick} />
          )}
        </CardContent>
      </Card>
      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddEmployee={handleAddEmployee}
      />
      <DeleteEmployeeDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        employeeName={selectedEmployee?.name || ''}
      />
    </>
  );
}
