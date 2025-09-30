'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeTable } from '@/components/employee-table';
import { employees as initialEmployees } from '@/lib/mock-data';
import type { Employee } from '@/lib/types';
import { AddEmployeeDialog } from '@/components/add-employee-dialog';
import { DeleteEmployeeDialog } from '@/components/delete-employee-dialog';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'avatarUrl' | 'imageHint' | 'status'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: `emp${employees.length + 1}`,
      avatarUrl: `https://picsum.photos/seed/${employees.length + 1}/40/40`,
      imageHint: 'person face',
      status: 'Active',
    };
    setEmployees([...employees, employee]);
  };

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id));
      setSelectedEmployee(null);
      setIsDeleteDialogOpen(false);
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
          <EmployeeTable employees={employees} onDeleteClick={handleDeleteClick} />
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
