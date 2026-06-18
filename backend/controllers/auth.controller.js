const jwt = require('jsonwebtoken');
const ethUtil = require('ethereumjs-util');
const config = require('../config');
const UserModel = require('../models/user.model');

const LOGIN_MESSAGE = 'Login Quant Fund';

const verifyWalletAddress = async (publicAddress, signature, message = LOGIN_MESSAGE) => {
  try {
    const msgBuffer = Buffer.from(message, 'utf8');
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);
    return address.toLowerCase() === publicAddress.toLowerCase();
  } catch (_e) {
    return false;
  }
};

exports.loginWithSignature = async (req, res) => {
  try {
    const { address, signature, referral_address } = req.body;
    if (!address || !signature) {
      return res.status(200).send({ success: false, msg: 'Address and signature required' });
    }
    const ok = await verifyWalletAddress(address, signature);
    if (!ok) {
      return res.status(200).send({ success: false, msg: 'Wallet signature verification failed!' });
    }
    let users = await UserModel.getUsersDetailsAddress({ address });
    if (users.length === 0) {
      let referral_id = '';
      if (referral_address) {
        const ref = await UserModel.getUserDetailsByAddress(referral_address);
        if (ref.length === 0) {
          return res.status(200).send({ success: false, msg: 'Referral code invalid' });
        }
        referral_id = ref[0].id;
      }
      const referral_code = 'REF' + Math.random().toString(36).substr(2, 5).toUpperCase();
      const saved = await UserModel.saveUserAddressDetails({ address, referral_id, referral_code });
      users = [{ id: saved.insertId, address, referral_code, is_admin: 0 }];
    }
    const user = users[0];
    const token = jwt.sign({ id: user.id, address: user.address }, config.JWT_SECRET_KEY, {
      expiresIn: config.SESSION_EXPIRES_IN,
    });
    return res.status(200).send({ success: true, msg: 'Login success', data: { id: user.id, address: user.address, referral_code: user.referral_code, authToken: token, is_admin: user.is_admin } });
  } catch (_e) {
    return res.status(200).send({ success: false, msg: 'Internal error' });
  }
};

exports.me = async (req, res) => {
  return res.status(200).send({ success: true, data: { id: req.user_id, address: req.address } });
};

exports.refresh = async (_req, res) => {
  return res.status(200).send({ success: false, msg: 'Not implemented' });
};

exports.logout = async (_req, res) => {
  return res.status(200).send({ success: true });
};


