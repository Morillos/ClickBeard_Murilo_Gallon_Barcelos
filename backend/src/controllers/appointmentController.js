const appointmentService = require("../services/appointmentService");

const appointmentController = {
  // Obter horários disponíveis para um barbeiro em uma data
  async getAvailableSlots(req, res) {
    try {
      const { barberId, date } = req.query;

      // Validação de entrada
      if (!barberId || !date) {
        return res
          .status(400)
          .json({ error: "Barbeiro e data são obrigatórios" });
      }

      if (isNaN(barberId)) {
        return res.status(400).json({ error: "ID de barbeiro inválido" });
      }

      const availableSlots = await appointmentService.getAvailableSlots(
        barberId,
        date
      );

      return res.status(200).json(availableSlots);
    } catch (error) {
      console.error("Erro ao obter horários disponíveis:", error);
      return res
        .status(500)
        .json({ error: "Erro ao obter horários disponíveis" });
    }
  },

  // Criar novo agendamento
  async create(req, res) {
    try {
      const { barber_id, specialty_id, appointment_date, appointment_time } =
        req.body;
      const user_id = req.userId;

      // Validação de entrada
      if (
        !barber_id ||
        !specialty_id ||
        !appointment_date ||
        !appointment_time
      ) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios" });
      }

      if (isNaN(barber_id) || isNaN(specialty_id)) {
        return res.status(400).json({ error: "IDs inválidos" });
      }

      // Regras de negócio
      const hasSpecialty = await appointmentService.barberHasSpecialty(
        barber_id,
        specialty_id
      );

      if (!hasSpecialty) {
        return res
          .status(400)
          .json({ error: "Barbeiro não possui essa especialidade" });
      }

      if (!appointmentService.isWithinWorkingHours(appointment_time)) {
        return res
          .status(400)
          .json({ error: "Horário fora do expediente (8h-18h)" });
      }

      const isAvailable = await appointmentService.slotIsAvailable(
        barber_id,
        appointment_date,
        appointment_time
      );

      if (!isAvailable) {
        return res
          .status(400)
          .json({ error: "Horário já ocupado para este barbeiro" });
      }

      if (!appointmentService.isInFuture(appointment_date, appointment_time)) {
        return res
          .status(400)
          .json({ error: "Não é possível agendar no passado" });
      }

      const appointment = await appointmentService.create(
        user_id,
        barber_id,
        specialty_id,
        appointment_date,
        appointment_time
      );

      return res.status(201).json(appointment);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return res.status(500).json({ error: "Erro ao criar agendamento" });
    }
  },

  // Listar agendamentos do usuário
  async getUserAppointments(req, res) {
    try {
      const appointments = await appointmentService.findByUserId(req.userId);
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Erro ao listar agendamentos do usuário:", error);
      return res.status(500).json({ error: "Erro ao listar agendamentos" });
    }
  },

  // Listar todos os agendamentos (admin)
  async getAllAppointments(req, res) {
    try {
      const { date, status } = req.query;

      const appointments = await appointmentService.findAll({ date, status });

      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Erro ao listar agendamentos:", error);
      return res.status(500).json({ error: "Erro ao listar agendamentos" });
    }
  },

  // Listar agendamentos do dia atual (admin)
  async getTodayAppointments(req, res) {
    try {
      const appointments = await appointmentService.findToday();
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Erro ao listar agendamentos do dia:", error);
      return res
        .status(500)
        .json({ error: "Erro ao listar agendamentos do dia" });
    }
  },

  // Listar agendamentos futuros (admin)
  async getFutureAppointments(req, res) {
    try {
      const appointments = await appointmentService.findFuture();
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Erro ao listar agendamentos futuros:", error);
      return res
        .status(500)
        .json({ error: "Erro ao listar agendamentos futuros" });
    }
  },

  // Cancelar agendamento
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.userId;
      const isAdmin = req.isAdmin;


      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      // Buscar agendamento
      const appointment = await appointmentService.findById(id);

      if (!appointment) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      // Verificar se é o dono do agendamento ou admin
      if (appointment.user_id !== user_id && !isAdmin) {
        return res.status(403).json({ error: "Não autorizado" });
      }

      // Verificar se o agendamento já foi cancelado ou completado
      if (appointment.status !== "scheduled") {
        return res
          .status(400)
          .json({ error: "Agendamento não pode ser cancelado" });
      }

      // Verificar se está dentro do prazo de 2 horas (apenas para clientes)
      if (!isAdmin) {
        
        if (!appointmentService.canUserCancel(appointment)) {
          return res.status(400).json({
            error:
              "Cancelamento deve ser feito com pelo menos 2 horas de antecedência",
          });
        }
      }

      // Cancelar agendamento
      const cancelledAppointment = await appointmentService.cancel(id);

      return res.status(200).json({
        message: "Agendamento cancelado com sucesso",
        appointment: cancelledAppointment,
      });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      return res.status(500).json({ error: "Erro ao cancelar agendamento" });
    }
  },

  // Completar agendamento (admin)
  async complete(req, res) {
    try {
      const { id } = req.params;

      // Validação de entrada
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const appointment = await appointmentService.complete(id);

      if (!appointment) {
        return res
          .status(404)
          .json({ error: "Agendamento não encontrado ou já finalizado" });
      }

      return res.status(200).json({
        message: "Agendamento marcado como concluído",
        appointment,
      });
    } catch (error) {
      console.error("Erro ao completar agendamento:", error);
      return res.status(500).json({ error: "Erro ao completar agendamento" });
    }
  },
};

module.exports = appointmentController;
