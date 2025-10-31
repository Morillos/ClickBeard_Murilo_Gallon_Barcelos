const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas (acessíveis com autenticação)
router.get('/', authMiddleware, specialtyController.getAll);
router.get('/:id', authMiddleware, specialtyController.getById);

// Rotas protegidas (apenas admin)
router.post('/', authMiddleware, adminMiddleware, specialtyController.create);
router.put('/:id', authMiddleware, adminMiddleware, specialtyController.update);
router.delete('/:id', authMiddleware, adminMiddleware, specialtyController.delete);

module.exports = router;
