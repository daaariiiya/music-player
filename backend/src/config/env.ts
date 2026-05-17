import 'dotenv/config';
import * as yup from 'yup';

const envSchema = yup.object({
  PORT: yup.number().integer().positive().default(8080),
  NODE_ENV: yup.string().oneOf(['development', 'production', 'test']).default('development'),
  DATABASE_URL: yup.string().required(),
  JWT_SECRET: yup.string().min(32).required(),
  JWT_REFRESH_SECRET: yup.string().min(32).required(),
  CLIENT_URL: yup
    .string()
    .matches(/^https?:\/\/.+/, 'CLIENT_URL must start with http:// or https://')
    .required(),
  BREVO_API_KEY: yup.string().required(),
  BREVO_SENDER_EMAIL: yup.string().email().required(),
  CLOUDINARY_CLOUD_NAME: yup.string().required(),
  CLOUDINARY_API_KEY: yup.string().required(),
  CLOUDINARY_API_SECRET: yup.string().required(),
});

let validated: yup.InferType<typeof envSchema>;

try {
  validated = envSchema.validateSync(process.env, { abortEarly: false, stripUnknown: true });
} catch (err) {
  if (err instanceof yup.ValidationError) {
    console.error('Invalid environment variables:');
    err.inner.forEach((e) => console.error(`  - ${e.path}: ${e.message}`));
  } else {
    console.error('Env validation failed:', err);
  }
  process.exit(1);
}

export const env = validated;
