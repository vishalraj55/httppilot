import { defineConfig } from 'prisma/config';
import 'dotenv/config';
import path from 'path';

export default defineConfig({
  schema: path.join(__dirname, 'src', 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
