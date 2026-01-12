import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';
import { asyncHandler } from '../utils/async-handler';

const router: Router = Router();

const upload = multer({
  dest: 'uploads/'
});

router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  asyncHandler(FileController.upload)
);

router.get(
  '/download/:id',
  authMiddleware,
  FileController.download
);

router.get('/list',
  authMiddleware,
  FileController.list
);

router.get('/:id',
  authMiddleware,
  FileController.get)
;

router.delete(
  "/delete/:id",
  authMiddleware,
  FileController.delete
);

router.put(
  '/update/:id',
  authMiddleware,
  upload.single('file'),
  FileController.update
);

export default router;
