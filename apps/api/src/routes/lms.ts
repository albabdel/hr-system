import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { zParse, HttpError } from '../errors.js';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { registry } from '../openapi.js';

const router = Router();

const CourseCreateBody = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
});
registry.registerPath({
  method: 'post', path: '/v1/lms/courses', tags: ['lms'],
  request: { body: { content: { 'application/json': { schema: CourseCreateBody } } } },
  responses: { 201: { description: 'Course created' } },
});
router.post('/courses', tenantResolver, requireAuth, rbacGuard(Action.LMS_MANAGE), async (req, res) => {
  const body = zParse(CourseCreateBody)(req.body);
  const { tenantId } = req.tenant!;
  const createdByUserId = req.user!.userId;
  const course = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.course.create({ data: { tenantId, createdByUserId, ...body } });
  });
  res.status(201).json(course);
});

registry.registerPath({ method: 'get', path: '/v1/lms/courses', tags: ['lms'], responses: { 200: { description: 'List of courses' } } });
router.get('/courses', tenantResolver, requireAuth, rbacGuard(Action.LMS_READ), async (req, res) => {
  const { tenantId } = req.tenant!;
  const courses = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.course.findMany({ orderBy: { createdAt: 'desc' } });
  });
  res.json(courses);
});

registry.registerPath({ method: 'get', path: '/v1/lms/courses/{id}', tags: ['lms'], responses: { 200: { description: 'Course details' } } });
router.get('/courses/:id', tenantResolver, requireAuth, rbacGuard(Action.LMS_READ), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;
  const course = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.course.findUnique({
      where: { id },
      include: { modules: { orderBy: { orderIndex: 'asc' }, include: { lessons: { orderBy: { orderIndex: 'asc' } } } } },
    });
  });
  if (!course) throw new HttpError(404, 'NOT_FOUND', 'Course not found');
  res.json(course);
});

registry.registerPath({ method: 'post', path: '/v1/lms/courses/{id}/enroll', tags: ['lms'], responses: { 201: { description: 'Enrolled' } } });
router.post('/courses/:id/enroll', tenantResolver, requireAuth, rbacGuard(Action.LMS_READ), async (req, res) => {
  const { id: courseId } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;
  const enrollment = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.enrollmentLms.create({ data: { tenantId, courseId, userId } });
  });
  res.status(201).json(enrollment);
});

registry.registerPath({ method: 'get', path: '/v1/lms/courses/{id}/enrollments', tags: ['lms'], responses: { 200: { description: 'List of enrollments' } } });
router.get('/courses/:id/enrollments', tenantResolver, requireAuth, rbacGuard(Action.LMS_MANAGE), async (req, res) => {
    const { id: courseId } = zParse(z.object({ id: z.string().uuid() }))(req.params);
    const { tenantId } = req.tenant!;
    const enrollments = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
        return tx.enrollmentLms.findMany({ where: { courseId }, include: { user: { select: { name: true, email: true } } } });
    });
    res.json(enrollments);
});

registry.registerPath({ method: 'post', path: '/v1/lms/lessons/{id}/attempts', tags: ['lms'], responses: { 201: { description: 'Attempt submitted' } } });
router.post('/lessons/:id/attempts', tenantResolver, requireAuth, rbacGuard(Action.LMS_READ), async (req, res) => {
    const { id: lessonId } = zParse(z.object({ id: z.string().uuid() }))(req.params);
    const { answers } = zParse(z.object({ answers: z.record(z.any()) }))(req.body);
    const { tenantId } = req.tenant!;
    const userId = req.user!.userId;

    const result = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
        const questions = await tx.quizQuestion.findMany({ where: { lessonId } });
        let correct = 0;
        for (const q of questions) {
            const userAnswers = answers[q.id] || [];
            const correctAnswers = q.correctAnswers as string[];
            if (JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
                correct++;
            }
        }
        const score = (correct / questions.length) * 100;
        return tx.attempt.create({ data: { tenantId, lessonId, userId, answers, score, completedAt: new Date() } });
    });
    res.status(201).json(result);
});

registry.registerPath({ method: 'post', path: '/v1/lms/certificates/:enrollmentId', tags: ['lms'], responses: { 201: { description: 'Certificate issued' } } });
router.post('/certificates/:enrollmentId', tenantResolver, requireAuth, rbacGuard(Action.LMS_MANAGE), async (req, res) => {
    const { enrollmentId } = zParse(z.object({ enrollmentId: z.string().uuid() }))(req.params);
    const { tenantId } = req.tenant!;
    const cert = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
        return tx.certificate.create({
            data: { tenantId, enrollmentId, url: `/certs/${crypto.randomUUID()}.pdf` }
        });
    });
    // In a real app, this would enqueue a worker job to generate the PDF.
    // await enqueueCertGen({ certId: cert.id });
    res.status(201).json(cert);
});


export default router;
