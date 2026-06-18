const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const config = require('../config');
const requestIp = require('request-ip');
const cron = require('node-cron');
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
router.use(bodyParser.json());
router.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
const pool = mysql.createPool({ host: config.mysqlHost, user: config.user, password: process.env.DB_PASS || config.password, database: config.database, port: config.mysqlPort });
const promisePool = pool.promise();

let multer = require('multer');
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        let filetype = '';
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpeg';
        }
        if (file.mimetype === 'image/jpg') {
            filetype = 'jpg';
        }
        if (file.mimetype === 'video/mp4') {
            filetype = 'mp4';
        }
        if (file.mimetype === 'application/pdf') {
            filetype = 'pdf';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
let upload = multer({ storage: storage });
let profileUplaod = upload.fields([{ name: 'profile_pic', maxCount: 1 }])


// All controllers call here
const registerController = require('../controllers/register.controller');
const adminController = require('../controllers/admin.controller');

// v1 Routers
const v1AuthRoutes = require('./auth.routes');
const v1UserRoutes = require('./users.routes');
const v1WalletRoutes = require('./wallets.routes');
const v1StakingRoutes = require('./staking.routes');
const v1TransactionRoutes = require('./transactions.routes');
const v1WithdrawalRoutes = require('./withdrawals.routes');
const v1ReferralRoutes = require('./referrals.routes');
const v1PlanRoutes = require('./plans.routes');
const v1NotificationRoutes = require('./notifications.routes');
const v1TicketRoutes = require('./tickets.routes');
const v1WebhookRoutes = require('./webhooks.routes');
const v1HealthRoutes = require('./health.routes');

// cron.schedule("0 1 * * *", async function () {
//     console.log('staiking Cron')
//     await registerController.usersStakingIncome();
// });
//Exchange Controller
// All Validations call here


// Register Routing
router.post('/userregister',  registerController.userRegister.bind()); //done
router.get('/getplandetail',  registerController.getPlanDetails.bind()); //done
router.post('/busddeposit', ensureWebToken, registerController.depositBUSD.bind()); //done
router.post('/gettransactionhistory',ensureWebToken, registerController.getTransactionHistory.bind());
router.post('/addStaking',ensureWebToken, registerController.addStaking.bind());
router.post('/getstakingHistory',ensureWebToken,registerController.getStakingHistory.bind());
router.post('/singalclaimreward',ensureWebToken,registerController.SingalClaimReward.bind());
router.post('/sellplan',ensureWebToken,registerController.SellPlan.bind());
router.post('/gettotalbalance',ensureWebToken,registerController.getTotalBalance.bind());
router.post('/getreferraluserslist',registerController.getReferralUsersList.bind());
router.post('/getwithdrawhistory',ensureWebToken,registerController.getWithdrawHistory.bind());
router.post('/gettotalinvasted',registerController.getTotalInvested.bind());
router.post('/withdrawcrypto',ensureWebToken,registerController.WithdrawCrypto.bind());


router.post('/getwithdrawrequest',adminController.getwithdrawrequest.bind());
router.post('/approvewithdrawrequest',adminController.approvewithdrawrequest.bind());
router.post('/rejectwithdrawrequest',adminController.rejectwithdrawrequest.bind());


router.get('/getuserlist',adminController.getUserList.bind());
router.get('/getstakingdetail',adminController.getStakingDetail.bind());
router.get('/getstakingearningdetail',adminController.getStakingEarningDetail.bind());
router.get('/getdepositbusd',adminController.getdepositBUSDDetail.bind());


// Mount versioned API routes (keep existing routes intact)
router.use('/v1/auth', v1AuthRoutes);
router.use('/v1/users', v1UserRoutes);
router.use('/v1/wallets', v1WalletRoutes);
router.use('/v1/staking', v1StakingRoutes);
router.use('/v1/transactions', v1TransactionRoutes);
router.use('/v1/withdrawals', v1WithdrawalRoutes);
router.use('/v1/referrals', v1ReferralRoutes);
router.use('/v1/plans', v1PlanRoutes);
router.use('/v1/notifications', v1NotificationRoutes);
router.use('/v1/tickets', v1TicketRoutes);
router.use('/v1/webhooks', v1WebhookRoutes);
router.use('/v1', v1HealthRoutes);

cron.schedule("* * * * *", async function () {
    console.log('userBUSDDepositCheck')
    await registerController.userBUSDDepositCheck();
});

const path1 = require('path')
exports.getImage = async (req, res) => {
    const image = req.params.image;
    const myPath = path1.resolve(process.cwd(), "uploads", image);
    res.sendFile(myPath);
}


router.get("/", function (request, response) {
    response.contentType("routerlication/json");
    response.end(JSON.stringify("Node is running"));
});

router.get("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}",
    });
});

router.post("*", function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: "Invalid Request {URL Not Found}",
    });
});

function ensureWebToken(req, res, next) {
    const x_access_token = req.headers['authorization'];
    if (typeof x_access_token !== undefined) {
        req.token = x_access_token;
        verifyJWT(req, res, next);
    } else {
        res.sendStatus(403);
    }
}

async function verifyJWT(req, res, next) {
    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            req.user_id = req.user.id;
            req.email = req.user.email;
            req.address = req.user.address;
            next();
        }
    })
}

function ensureWebTokenForAdmin(req, res, next) {

    const x_access_token = req.headers['authorization'];
    if (typeof x_access_token !== undefined) {
        req.token = x_access_token;
        verifyJWTForAdmin(req, res, next);
    } else {
        res.sendStatus(403);
    }
}


async function verifyJWTForAdmin(req, res, next) {
    jwt.verify(req.token, config.JWT_SECRET_KEY, async function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            const _data = await jwt.decode(req.token, {
                complete: true,
                json: true
            });
            req.user = _data['payload'];
            if (req.user.role != 'cpadmin') {
                return res.sendStatus(403);
            }
            next();
        }
    })
}

module.exports.routes = router;