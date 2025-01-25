import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // logger
  const logger = new Logger('Bootstrap');
  // create app
  const app = await NestFactory.create(AppModule);
  // set cors
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });
  // secure http headers
  app.use(
    helmet({
      contentSecurityPolicy: undefined,
    }),
  );
  // set global prefix
  app.setGlobalPrefix('api/v1');
  // open port
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
void bootstrap();
