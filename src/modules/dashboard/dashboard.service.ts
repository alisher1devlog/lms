import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HomeworkSubStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    const [
      totalUsers,
      totalCourses,
      totalRevenue,
      recentPurchases,
      usersByRole,
      coursesByCategory,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.purchasedCourse.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.purchasedCourse.findMany({
        take: 10,
        orderBy: { purchasedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.course.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
    ]);

    // Get category names
    const categories = await this.prisma.courseCategory.findMany({
      where: {
        id: { in: coursesByCategory.map((c) => c.categoryId) },
      },
    });

    const coursesByCategoryWithNames = coursesByCategory.map((c) => ({
      category:
        categories.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
      count: c._count,
    }));

    return {
      totalUsers,
      totalCourses,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentPurchases,
      usersByRole: usersByRole.map((u) => ({
        role: u.role,
        count: u._count,
      })),
      coursesByCategory: coursesByCategoryWithNames,
    };
  }

  async getMentorDashboard(mentorId: number) {
    const [myCourses, totalStudents, totalRevenue, recentEnrollments] =
      await Promise.all([
        this.prisma.course.findMany({
          where: { mentorId },
          include: {
            _count: {
              select: {
                purchasedCourses: true,
                assignedCourses: true,
              },
            },
          },
        }),
        this.prisma.purchasedCourse.count({
          where: {
            course: { mentorId },
          },
        }),
        this.prisma.purchasedCourse.aggregate({
          where: {
            course: { mentorId },
          },
          _sum: { amount: true },
        }),
        this.prisma.purchasedCourse.findMany({
          where: {
            course: { mentorId },
          },
          take: 10,
          orderBy: { purchasedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
      ]);

    return {
      myCourses: myCourses.map((course) => ({
        ...course,
        totalStudents:
          course._count.purchasedCourses + course._count.assignedCourses,
      })),
      totalStudents,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentEnrollments,
    };
  }

  async getStudentDashboard(studentId: number) {
    const [enrolledCourses, completedLessons, pendingHomeworks, examResults] =
      await Promise.all([
        // Get enrolled courses count
        Promise.all([
          this.prisma.purchasedCourse.count({ where: { userId: studentId } }),
          this.prisma.assignedCourse.count({ where: { userId: studentId } }),
        ]).then(([purchased, assigned]) => purchased + assigned),

        // Get completed lessons count
        this.prisma.lessonView.count({
          where: { userId: studentId, view: true },
        }),

        // Get pending homeworks
        this.prisma.homeworkSubmission.count({
          where: {
            userId: studentId,
            status: HomeworkSubStatus.PENDING,
          },
        }),

        // Get recent exam results
        this.prisma.examResult.findMany({
          where: { userId: studentId },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            lessonGroup: {
              select: {
                name: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
      ]);

    return {
      enrolledCourses,
      completedLessons,
      pendingHomeworks,
      examResults,
    };
  }
}
