import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  let app = null;
  let httpsOptions = null;

  if (
    fs.existsSync(path.join(__dirname + '/private/fullchain.pem')) &&
    fs.existsSync(path.join(__dirname + '/private/privkey.pem'))
  ) {
    console.log('HTTPS Server is available');
    // Create the HTTPS server options
    httpsOptions = {
      key: fs.readFileSync(
        path.join(__dirname + '/private/privkey.pem'),
        'ascii',
      ),
      cert: fs.readFileSync(
        path.join(__dirname + '/private/fullchain.pem'),
        'ascii',
      ),
    };
  }

  if (httpsOptions) {
    app = await NestFactory.create(AppModule, { cors: true, httpsOptions });
  } else {
    app = await NestFactory.create(AppModule, { cors: true });
  }

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
