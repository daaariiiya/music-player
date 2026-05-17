import * as yup from 'yup';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const photoFileSchema = yup
  .mixed<File>()
  .test('exists', 'Photo file is required.', (v) => v instanceof File)
  .test('size', `Max file size is ${MAX_BYTES} bytes.`, (v) => !v || (v as File).size <= MAX_BYTES)
  .test('mime', `Allowed types: ${ALLOWED_MIME.join(', ')}`, (v) =>
    !v || ALLOWED_MIME.includes((v as File).type)
  )
  .required();
