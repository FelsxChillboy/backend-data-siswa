import { Router } from 'express';

import SiswaController from '../controllers/SiswaController.js';
import {
  validateCreateSiswa,
  validateUpdateSiswa,
} from '../middlewares/validateSiswa.js';

const router = Router();

router.get('/', SiswaController.index);
router.get('/:kode', SiswaController.show);
router.post('/', validateCreateSiswa, SiswaController.store);
router.put('/:kode', validateUpdateSiswa, SiswaController.update);
router.delete('/:kode', SiswaController.destroy);

export default router;
