"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const checkAuth_middleware_1 = __importDefault(require("../middleware/checkAuth.middleware"));
const router = express_1.Router();
router
    .route('/users')
    .post(user_controller_1.default.createUser)
    .get(checkAuth_middleware_1.default, user_controller_1.default.fetchUsers);
router.route('/user').get(checkAuth_middleware_1.default, user_controller_1.default.fetchAuthUser);
router.route('/user').put(checkAuth_middleware_1.default, user_controller_1.default.updateUserInfo);
router.route('/user').delete(checkAuth_middleware_1.default, user_controller_1.default.deleteAccount);
router.get('/something', user_controller_1.default.lolPop);
router.route('/auth').post(user_controller_1.default.login);
exports.default = router;
