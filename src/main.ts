import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as yaml from 'js-yaml';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // allow the CPA frontend to actually call this API from the browser
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? '*',
  });

  const config = new DocumentBuilder()
    .setTitle('Step Length Project API')
    .setDescription(
      'NestJS server for the Step Length experiment. Handles operator ' +
        'auth, session/candidate/measurement management with file-based ' +
        'persistence, and proxies requests to the Experiment API.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // serve swagger UI at /api
  SwaggerModule.setup('api', app, document);

  // also write the spec to disk as both JSON and YAML, per submission requirements
  const outDir = 'openapi';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/openapi.json`, JSON.stringify(document, null, 2));
  writeFileSync(`${outDir}/openapi.yaml`, yaml.dump(document));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI on http://localhost:${port}/api`);
}

void bootstrap();
