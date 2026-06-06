import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Ensure uploads directory exists ─────────────────────────────────────────
  const uploadsDir = join(process.cwd(), 'uploads', 'avatars');
  mkdirSync(uploadsDir, { recursive: true });

  // ── Serve static files from /uploads ────────────────────────────────────────
  // Accessible at: http://localhost:4000/uploads/avatars/<filename>
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // ── Global exception filter (error envelope) ─────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global response interceptor (success envelope) ──────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Application running on: http://localhost:4000`);
}
bootstrap();
