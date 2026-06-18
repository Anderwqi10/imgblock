const TicketModel = require('../models/ticket.model');
const TicketMessageModel = require('../models/ticketMessage.model');

exports.create = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(200).send({ success: false, msg: 'Subject required' });
    const result = await TicketModel.create({ user_id: req.user_id, subject });
    return res.status(200).send({ success: true, id: result.insertId });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};

exports.list = async (req, res) => {
  try {
    const rows = await TicketModel.list({ user_id: req.user_id });
    return res.status(200).send({ success: true, data: rows });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};

exports.messages = async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await TicketMessageModel.list({ ticket_id: id });
    return res.status(200).send({ success: true, data: rows });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) return res.status(200).send({ success: false, msg: 'Message required' });
    await TicketMessageModel.create({ ticket_id: id, sender_id: req.user_id, message });
    return res.status(200).send({ success: true });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};


