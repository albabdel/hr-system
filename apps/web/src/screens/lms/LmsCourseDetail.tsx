import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

type Lesson = { id: string; title: string; type: string };
type Module = { id: string; title: string; lessons: Lesson[] };
type Course = { id: string; title: string; description: string; modules: Module[] };

export default function LmsCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['lms-course', id],
    queryFn: () => api<Course>(`/v1/lms/courses/${id}`),
  });

  const enroll = useMutation({
    mutationFn: () => api(`/v1/lms/courses/${id}/enroll`, { method: 'POST' }),
    onSuccess: () => {
      alert('Enrolled successfully!');
      qc.invalidateQueries({ queryKey: ['lms-course', id] });
    },
    onError: (err: any) => alert(`Enrollment failed: ${err.message}`),
  });

  if (isLoading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>
        <button onClick={() => enroll.mutate()} className="rounded bg-blue-600 text-white px-4 py-2">
          Enroll Now
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>
        {course.modules.map((module) => (
          <div key={module.id} className="border rounded-lg">
            <h3 className="font-bold text-lg p-4 bg-gray-50 border-b">{module.title}</h3>
            <ul className="divide-y">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/lms/lessons/${lesson.id}`} className="flex justify-between items-center">
                    <span>{lesson.title}</span>
                    <span className="text-sm uppercase text-gray-500">{lesson.type}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
