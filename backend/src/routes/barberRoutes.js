const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas (acessíveis com autenticação)
router.get('/', authMiddleware, barberController.getAll);
router.get('/:id', authMiddleware, barberController.getById);
router.get('/specialty/:specialtyId', authMiddleware, barberController.getBySpecialty);

// Rotas de especialidades (apenas admin)
router.get('/:id/specialties', authMiddleware, adminMiddleware, barberController.getSpecialties);
router.put('/:id/specialties', authMiddleware, adminMiddleware, barberController.updateSpecialties);

// Rotas de barbeiros (apenas admin)
router.post('/', authMiddleware, adminMiddleware, barberController.create);
router.put('/:id', authMiddleware, adminMiddleware, barberController.update);
router.delete('/:id', authMiddleware, adminMiddleware, barberController.delete);

module.exports = router;
