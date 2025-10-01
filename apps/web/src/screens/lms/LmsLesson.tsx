import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';

type Lesson = { id: string; title: string; type: 'video' | 'text' | 'quiz'; content: any };
type QuizQuestion = { id: string, questionText: string, options: Array<{ id: string, text: string }> };

function QuizView({ lesson, questions }: { lesson: Lesson, questions: QuizQuestion[] }) {
    const [result, setResult] = React.useState<{ score: number } | null>(null);

    const submit = useMutation({
        mutationFn: (answers: any) => api(`/v1/lms/lessons/${lesson.id}/attempts`, { method: 'POST', body: JSON.stringify({ answers }) }),
        onSuccess: (data: any) => setResult({ score: data.score }),
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const answers: Record<string, string[]> = {};
        for (const q of questions) {
            answers[q.id] = fd.getAll(q.id) as string[];
        }
        submit.mutate(answers);
    };

    if (result) return <div className="p-4 bg-blue-100 rounded">Your score: {result.score.toFixed(1)}%</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, i) => (
                <div key={q.id}>
                    <p className="font-semibold">{i + 1}. {q.questionText}</p>
                    <div className="mt-2 space-y-2">
                        {q.options.map(opt => (
                            <label key={opt.id} className="flex items-center gap-2">
                                <input type="checkbox" name={q.id} value={opt.id} />
                                {opt.text}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button type="submit" disabled={submit.isPending} className="rounded bg-blue-600 text-white px-4 py-2">
                {submit.isPending ? 'Submitting...' : 'Submit Quiz'}
            </button>
        </form>
    );
}

export default function LmsLesson() {
  const { id } = useParams<{ id: string }>();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lms-lesson', id],
    // This is a mock; a real API would have a /v1/lms/lessons/:id endpoint
    queryFn: async () => {
        // This is a simplified fetcher. In a real app, you'd fetch lesson and quiz questions.
        // For now, we simulate quiz content.
        if (id?.includes('quiz')) { // mock
            return {
                id: 'quiz-1', title: 'Knowledge Check', type: 'quiz',
                content: [
                    { id: 'q1', questionText: 'Which is a valid RBAC role?', options: [{ id: 'a', text: 'ADMIN' }, { id: 'b', text: 'USER' }, { id: 'c', text: 'OWNER' }], correctAnswers: ['c'] },
                    { id: 'q2', questionText: 'What DB is used?', options: [{ id: 'a', text: 'Postgres' }, { id: 'b', text: 'MySQL' }], correctAnswers: ['a'] }
                ]
            } as any;
        }
        return { id: 'lesson-1', title: 'Intro to SaaS', type: 'text', content: { html: '<p>Welcome!</p>' } } as any
    },
  });

  if (isLoading) return <p>Loading lesson...</p>;
  if (!lesson) return <p>Lesson not found.</p>;

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return <video src={lesson.content.url} controls className="w-full rounded-lg" />;
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: lesson.content.html }} className="prose" />;
      case 'quiz':
        return <QuizView lesson={lesson} questions={lesson.content as QuizQuestion[]} />;
      default:
        return <p>Unsupported lesson type.</p>;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{lesson.title}</h1>
      <div className="p-4 border rounded-lg bg-white">
        {renderContent()}
      </div>
    </div>
  );
}
