# why use nest

```
enterprise grade
focus on app, not config
```

# get node lts

```bash
nvm install --lts
nvm use --lts
node -v
```

# get nest cli globally

```bash
npm i -g @nestjs/cli
```

# make nest app

```bash
nest new
```

# run watch mode

```bash
npm run start:dev
```

# lint and format

```bash
npm run lint
npm run format
```

# edit entry

```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

# edit root module

```javascript
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

# declutter

```bash
rm src/app.controller.spec.ts
rm src/app.controller.ts
rm src/app.service.ts
```

# commit

```
make first commit
```

# create new github remote repo

```bash
# set name
# set desc
# then push existing to remote
git remote add origin dsadsa
git branch -M main
git push -u origin main
```
