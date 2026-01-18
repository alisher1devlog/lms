<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

#LMS(Learning Management System) loyihasi

## Ma'lumotlar bazasi strukturasi

### types
```
UserRole = ADMIN | MENTOR | ASSISTANT | STUDENT

CourseLevel = BEGINNER | PRE_INTERMEDIATE | INTERMEDIATE | UPPER_INTERMEDIATE | ADVANCED

PaidVia = PAYME | CLICK | CASH

HomeworkSubStatus = PENDING | APPROVED | REJECTED

ExamAnswer = variantA | variantB | variantC | variantD

```

### Users jadval
```
    id SERIAL NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role "UserRole" NOT NULL DEFAULT 'STUDENT',
    fullName TEXT NOT NULL,
    image TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
```
### MentorProfile
```
    "id" SERIAL NOT NULL,
    "about" TEXT,
    "job" TEXT,
    "experience" INTEGER NOT NULL,
    "telegram" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "github" TEXT,
    "website" TEXT,
     user_id: serial FOREIGN KEY REFERENCES users(id)
```
### CourseCategory 
```
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```
### Course
```
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    about TEXT NOT NULL,
    price DECIMAL NOT NULL,
    banner TEXT NOT NULL,
    introVideo TEXT,
    level "CourseLevel" NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    categoryId INTEGER NOT NULL,
    mentorId INTEGER NOT NULL,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("categoryId") REFERENCES "CourseCategory"("id") ON DELETE CASCADE,
    FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE
```
### AssignedCourse
```
    userId INTEGER NOT NULL,
    courseId UUID NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
```
### PurchasedCourse
```
    courseId UUID NOT NULL,
    userId INTEGER NOT NULL,
    amount DECIMAL,
    paidVia "PaidVia" NOT NULL,
    purchasedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
```
### Rating
```
    id SERIAL PRIMARY KEY,
    rate INTEGER NOT NULL,
    comment TEXT NOT NULL,
    courseId UUID NOT NULL,
    userId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
```
### LastActivity
```
    id SERIAL PRIMARY KEY,
    userId INTEGER UNIQUE NOT NULL,
    courseId UUID,
    groupId INTEGER,
    lessonId UUID,
    url TEXT, 
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("id"),
    FOREIGN KEY ("groupId") REFERENCES "LessonGroup"("id"),
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
```
### LessonBo'lim
```
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    courseId UUID NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("courseId") REFERENCES "Course"("id")
```
### Lesson
```
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    about TEXT NOT NULL,
    video TEXT NOT NULL,
    bolimId INTEGER NOT NULL,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("groupId") REFERENCES "LessonGroup"("id")
```
### LessonView
```
    lessonId UUID NOT NULL,
    userId INTEGER NOT NULL,
    view BOOLEAN NOT NULL,

    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
```
### LessonFile
```
    id SERIAL PRIMARY KEY,
    file TEXT NOT NULL,
    note TEXT,
    lessonId UUID NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
```
### Homework
```
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    file TEXT,
    lessonId UUID UNIQUE NOT NULL,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE    ON UPDATE CASCADE
```
### HomeworkSubmission
```
    id SERIAL PRIMARY KEY,
    text TEXT,
    file TEXT NOT NULL,
    reason TEXT,
    status "HomeworkSubStatus" DEFAULT 'PENDING',
    homeworkId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```
### Exam
```
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    variantA TEXT NOT NULL,
    variantB TEXT NOT NULL,
    variantC TEXT NOT NULL,
    variantD TEXT NOT NULL,
    answer "ExamAnswer" NOT NULL,
    lessonBolimId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("lessonGroupId") REFERENCES "LessonGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE
```
### ExamResult
```
    id SERIAL PRIMARY KEY,
    lessonGroupId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    corrects INTEGER NOT NULL,
    wrongs INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY ("lessonGroupId") REFERENCES "LessonGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```
### Question
```
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    courseId TEXT NOT NULL,
    text TEXT NOT NULL,
    file TEXT,
    read BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE
```
### QuestionAnswer
```
    id SERIAL PRIMARY KEY,
    questionId INTEGER UNIQUE NOT NULL,
    userId INTEGER NOT NULL,
    text TEXT NOT NULL,
    file TEXT,
    updatedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE,
    CONSTRAINT "QuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
```

## Endpointlar

LMS API Endpoints
1. Authentication & Authorization
POST /api/auth/register

Body: { phone, password, fullName, role? }
Response: { user, token }
Description: Yangi foydalanuvchi ro'yxatdan o'tkazish

POST /api/auth/login

Body: { phone, password }
Response: { user, token }
Description: Tizimga kirish

POST /api/auth/logout

Headers: Authorization: Bearer {token}
Response: { message }
Description: Tizimdan chiqish

GET /api/auth/me

Headers: Authorization: Bearer {token}
Response: { user }
Description: Joriy foydalanuvchi ma'lumotlarini olish


2. User Management
GET /api/users

Headers: Authorization: Bearer {token}
Query: ?role=STUDENT&page=1&limit=10
Response: { users[], total, page, limit }
Access: ADMIN, MENTOR, ASSISTANT

GET /api/users/:id

Headers: Authorization: Bearer {token}
Response: { user }
Access: ADMIN, MENTOR, ASSISTANT, own profile

PUT /api/users/:id

Headers: Authorization: Bearer {token}
Body: { fullName?, image?, phone?, password? }
Response: { user }
Access: ADMIN, own profile

DELETE /api/users/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN


3. Mentor Profile
GET /api/mentors

Response: { mentors[] }
Description: Barcha mentorlar ro'yxati

GET /api/mentors/:id

Response: { mentor, profile, courses[] }
Description: Mentor profili va kurslari

POST /api/mentors/profile

Headers: Authorization: Bearer {token}
Body: { about, job, experience, telegram?, instagram?, linkedin?, facebook?, github?, website? }
Response: { profile }
Access: MENTOR

PUT /api/mentors/profile

Headers: Authorization: Bearer {token}
Body: { about?, job?, experience?, ... }
Response: { profile }
Access: MENTOR


4. Course Categories
GET /api/categories

Response: { categories[] }

POST /api/categories

Headers: Authorization: Bearer {token}
Body: { name }
Response: { category }
Access: ADMIN

PUT /api/categories/:id

Headers: Authorization: Bearer {token}
Body: { name }
Response: { category }
Access: ADMIN

DELETE /api/categories/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN


5. Courses
GET /api/courses

Query: ?categoryId=1&level=BEGINNER&published=true&page=1&limit=10&search=react
Response: { courses[], total, page, limit }

GET /api/courses/:id

Response: { course, mentor, category, lessonGroups[], ratings[] }

POST /api/courses

Headers: Authorization: Bearer {token}
Body: { name, about, price, banner, introVideo?, level, categoryId }
Response: { course }
Access: ADMIN, MENTOR

PUT /api/courses/:id

Headers: Authorization: Bearer {token}
Body: { name?, about?, price?, banner?, introVideo?, level?, published? }
Response: { course }
Access: ADMIN, MENTOR (own courses)

DELETE /api/courses/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)

GET /api/courses/:id/students

Headers: Authorization: Bearer {token}
Response: { students[] }
Access: ADMIN, MENTOR (own courses), ASSISTANT


6. Course Purchase & Assignment
POST /api/courses/:id/purchase

Headers: Authorization: Bearer {token}
Body: { paidVia, amount }
Response: { purchase }
Access: STUDENT

POST /api/courses/:id/assign

Headers: Authorization: Bearer {token}
Body: { userId }
Response: { assignment }
Access: ADMIN, ASSISTANT
Description: Talabaga kursni bepul biriktirish

GET /api/my-courses

Headers: Authorization: Bearer {token}
Response: { courses[] }
Access: STUDENT
Description: Sotib olingan va biriktirilgan kurslar


7. Ratings
POST /api/courses/:courseId/ratings

Headers: Authorization: Bearer {token}
Body: { rate, comment }
Response: { rating }
Access: STUDENT (faqat sotib olgan kurs uchun)

GET /api/courses/:courseId/ratings

Query: ?page=1&limit=10
Response: { ratings[], average, total }

PUT /api/ratings/:id

Headers: Authorization: Bearer {token}
Body: { rate?, comment? }
Response: { rating }
Access: Own rating

DELETE /api/ratings/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, own rating


8. Lesson Groups (Bo'limlar)
GET /api/courses/:courseId/groups

Response: { groups[] }

POST /api/courses/:courseId/groups

Headers: Authorization: Bearer {token}
Body: { name }
Response: { group }
Access: ADMIN, MENTOR (own courses)

PUT /api/groups/:id

Headers: Authorization: Bearer {token}
Body: { name }
Response: { group }
Access: ADMIN, MENTOR (own courses)

DELETE /api/groups/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)


9. Lessons
GET /api/groups/:groupId/lessons

Headers: Authorization: Bearer {token}
Response: { lessons[] }
Access: Kursga ega bo'lgan talabalar

GET /api/lessons/:id

Headers: Authorization: Bearer {token}
Response: { lesson, files[], homework? }
Access: Kursga ega bo'lgan talabalar

POST /api/groups/:groupId/lessons

Headers: Authorization: Bearer {token}
Body: { name, about, video }
Response: { lesson }
Access: ADMIN, MENTOR (own courses)

PUT /api/lessons/:id

Headers: Authorization: Bearer {token}
Body: { name?, about?, video? }
Response: { lesson }
Access: ADMIN, MENTOR (own courses)

DELETE /api/lessons/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)

POST /api/lessons/:id/view

Headers: Authorization: Bearer {token}
Body: { view: true }
Response: { lessonView }
Access: STUDENT
Description: Darsni ko'rilgan deb belgilash


10. Lesson Files
GET /api/lessons/:lessonId/files

Headers: Authorization: Bearer {token}
Response: { files[] }

POST /api/lessons/:lessonId/files

Headers: Authorization: Bearer {token}
Body: { file, note? }
Response: { file }
Access: ADMIN, MENTOR (own courses)

DELETE /api/files/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)


11. Homework
POST /api/lessons/:lessonId/homework

Headers: Authorization: Bearer {token}
Body: { task, file? }
Response: { homework }
Access: ADMIN, MENTOR (own courses)

PUT /api/homework/:id

Headers: Authorization: Bearer {token}
Body: { task?, file? }
Response: { homework }
Access: ADMIN, MENTOR (own courses)

DELETE /api/homework/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)


12. Homework Submissions
POST /api/homework/:homeworkId/submit

Headers: Authorization: Bearer {token}
Body: { text?, file }
Response: { submission }
Access: STUDENT

GET /api/homework/:homeworkId/submissions

Headers: Authorization: Bearer {token}
Query: ?status=PENDING&page=1&limit=10
Response: { submissions[], total }
Access: ADMIN, MENTOR (own courses), ASSISTANT

PUT /api/submissions/:id/status

Headers: Authorization: Bearer {token}
Body: { status, reason? }
Response: { submission }
Access: ADMIN, MENTOR (own courses), ASSISTANT

GET /api/my-submissions

Headers: Authorization: Bearer {token}
Response: { submissions[] }
Access: STUDENT


13. Exams
POST /api/groups/:groupId/exams

Headers: Authorization: Bearer {token}
Body: { question, variantA, variantB, variantC, variantD, answer }
Response: { exam }
Access: ADMIN, MENTOR (own courses)

GET /api/groups/:groupId/exams

Headers: Authorization: Bearer {token}
Response: { exams[] } (without answers)
Access: STUDENT (kursga ega bo'lganlar)

POST /api/exams/submit

Headers: Authorization: Bearer {token}
Body: { lessonGroupId, answers: [{ examId, answer }] }
Response: { result: { passed, corrects, wrongs } }
Access: STUDENT

GET /api/exams/results

Headers: Authorization: Bearer {token}
Query: ?courseId=uuid&groupId=1
Response: { results[] }
Access: STUDENT (own results)

DELETE /api/exams/:id

Headers: Authorization: Bearer {token}
Response: { message }
Access: ADMIN, MENTOR (own courses)


14. Questions & Answers
POST /api/courses/:courseId/questions

Headers: Authorization: Bearer {token}
Body: { text, file? }
Response: { question }
Access: STUDENT (kursga ega bo'lganlar)

GET /api/courses/:courseId/questions

Headers: Authorization: Bearer {token}
Query: ?read=false&page=1&limit=10
Response: { questions[], total }
Access: ADMIN, MENTOR (own courses), ASSISTANT

PUT /api/questions/:id/read

Headers: Authorization: Bearer {token}
Response: { question }
Access: ADMIN, MENTOR, ASSISTANT

POST /api/questions/:questionId/answer

Headers: Authorization: Bearer {token}
Body: { text, file? }
Response: { answer }
Access: ADMIN, MENTOR (own courses), ASSISTANT

PUT /api/answers/:id

Headers: Authorization: Bearer {token}
Body: { text?, file? }
Response: { answer }
Access: ADMIN, MENTOR, ASSISTANT

GET /api/my-questions

Headers: Authorization: Bearer {token}
Response: { questions[] }
Access: STUDENT


15. Last Activity
GET /api/activity/last

Headers: Authorization: Bearer {token}
Response: { activity: { courseId, groupId, lessonId, url } }
Access: STUDENT

POST /api/activity/update

Headers: Authorization: Bearer {token}
Body: { courseId?, groupId?, lessonId?, url? }
Response: { activity }
Access: STUDENT


16. Dashboard & Statistics
GET /api/dashboard/admin

Headers: Authorization: Bearer {token}
Response: { totalUsers, totalCourses, totalRevenue, recentPurchases[], usersByRole, coursesByCategory }
Access: ADMIN

GET /api/dashboard/mentor

Headers: Authorization: Bearer {token}
Response: { myCourses, totalStudents, totalRevenue, recentEnrollments[] }
Access: MENTOR

GET /api/dashboard/student

Headers: Authorization: Bearer {token}
Response: { enrolledCourses, completedLessons, pendingHomeworks, examResults[] }
Access: STUDENT


Notes:

Barcha endpointlar JSON formatida ma'lumot qaytaradi
Xatoliklar uchun standart HTTP status kodlari ishlatiladi (400, 401, 403, 404, 500)
File upload endpointlari multipart/form-data formatida ishlaydi
Pagination default: page=1, limit=10
Token muddati: 30 kun (yoki sozlamalarga qarab)
