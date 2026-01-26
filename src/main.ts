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

  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Learning Management System API dokumentatsiyasi')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Authentication')
    .addTag('Verification', 'Verification va OTP boshqaruvi')
    .addTag('Profile', 'Profile boshqaruvi')
    .addTag('Courses', 'Kurslar')
    .addTag('Course Category', 'Kategoriyalar')
    .addTag('Course Rating', 'Baholar')
    .addTag('Purchased Courses', 'Sotib olingan kurslar')
    .addTag('Lessons', 'Darslar')
    .addTag('Lesson Groups', "Dars bo'limlari")
    .addTag('Lesson Files', 'Dars fayllari')
    .addTag('Exams', 'Imtihonlar')
    .addTag('Homework', 'Vazifalar')
    .addTag('Questions & Answers', 'Savollar va Javoblar')
    .addTag('Users', 'Foydalanuvchilar')
    .addTag('Payment', "To'lovlar")
    .addTag('Contact', 'Aloqa')
    .addTag('Files', 'Fayllar')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(` Server ishga tushdi: http://localhost:${port}`);
  console.log(` Swagger dokumentatsiyasi: http://localhost:${port}/api/docs`);
}
bootstrap();
