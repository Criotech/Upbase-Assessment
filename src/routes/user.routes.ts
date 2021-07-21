import { Router } from 'express';
import UserCtrl from '../controllers/user.controller';
import checkAuth from '../middleware/checkAuth.middleware';

const router = Router();

router
  .route('/users')
  .post(UserCtrl.createUser)
  .get(checkAuth, UserCtrl.fetchUsers)

router.route('/user').get(checkAuth, UserCtrl.fetchAuthUser);
router.route('/user').put(checkAuth, UserCtrl.updateUserInfo);
router.route('/user').delete(checkAuth, UserCtrl.deleteAccount);
router.get('/something', UserCtrl.lolPop)

router.route('/auth').post(UserCtrl.login);


export default router;