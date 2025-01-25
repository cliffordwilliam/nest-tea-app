import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  // Set up CORS for production
  app.enableCors({
    // origin: isProduction ? process.env.FRONTEND_URL : true,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });
  // Secure HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );
  // Set global prefix for versioning
  app.setGlobalPrefix('api/v1');
  // Open port
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
void bootstrap();
