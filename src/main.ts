import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type', 'apikey', 'Accept-Encoding'],
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  const configService = app.get(ConfigService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('A simple REST API with CRUD endpoints for a simple user management system')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, swaggerConfig, options);
  SwaggerModule.setup('api', app, document);
  // enable useContainer to be able to inject into class validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(configService.get('PORT'));
}
bootstrap();
