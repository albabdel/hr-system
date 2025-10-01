import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

type Course = { id: string; title: string; description?: string };

export default function LmsCoursesList() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['lms-courses'],
    queryFn: () => api<Course[]>('/v1/lms/courses'),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Courses</h1>
      {isLoading && <p>Loading courses...</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map((course) => (
          <Link to={`/lms/courses/${course.id}`} key={course.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description || 'No description'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
