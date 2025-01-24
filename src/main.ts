import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // todo: do this when i get my frontend deployed
    // origin: 'https://your-frontend-url.com',
    // methods: 'GET,POST,PUT,DELETE',
    // credentials: true, // allow auth headers
  });
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
