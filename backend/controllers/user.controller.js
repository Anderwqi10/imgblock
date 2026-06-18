const UserModel = require('../models/user.model');

exports.getMe = async (req, res) => {
  try {
    const users = await UserModel.getUsersAddress({ address: req.address });
    if (users.length === 0) {
      return res.status(200).send({ success: false, msg: 'User not found' });
    }
    const u = users[0];
    return res.status(200).send({ success: true, data: { id: u.id, address: u.address, token_balance: u.token_balance, MBUSD_balance: u.MBUSD_balance, referral_code: u.referral_code } });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};

exports.updateMe = async (_req, res) => {
  return res.status(200).send({ success: false, msg: 'Not implemented' });
};
