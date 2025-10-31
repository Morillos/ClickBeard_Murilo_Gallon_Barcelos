const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas para clientes
router.get('/available-slots', authMiddleware, appointmentController.getAvailableSlots);
router.post('/', authMiddleware, appointmentController.create);
router.get('/my-appointments', authMiddleware, appointmentController.getUserAppointments);
router.patch('/:id/cancel', authMiddleware, appointmentController.cancel);

// Rotas para admin
router.get('/all', authMiddleware, adminMiddleware, appointmentController.getAllAppointments);
router.get('/today', authMiddleware, adminMiddleware, appointmentController.getTodayAppointments);
router.get('/future', authMiddleware, adminMiddleware, appointmentController.getFutureAppointments);
router.patch('/:id/complete', authMiddleware, adminMiddleware, appointmentController.complete);

module.exports = router;
