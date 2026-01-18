import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Learning Management System API dokumentatsiyasi')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autentifikatsiya')
    .addTag('Users', 'Foydalanuvchilar')
    .addTag('Mentors', 'Mentorlar')
    .addTag('Categories', 'Kategoriyalar')
    .addTag('Courses', 'Kurslar')
    .addTag('Lesson Groups', "Dars bo'limlari")
    .addTag('Lessons', 'Darslar')
    .addTag('Homework', 'Vazifalar')
    .addTag('Exams', 'Imtihonlar')
    .addTag('Questions', 'Savollar')
    .addTag('Ratings', 'Baholar')
    .addTag('Activity', 'Faoliyat')
    .addTag('Dashboard', 'Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server ishga tushdi: http://localhost:${port}`);
  console.log(`📚 Swagger dokumentatsiyasi: http://localhost:${port}/api/docs`);
}
bootstrap();
