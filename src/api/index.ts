import { Router } from 'express';
import cardGroupsRouter from './cardGroups.js';
import membersRouter from './members.js';
import usersRouter from './users.js';
import memberDeleteRouter from './memberDelete.js';
import carpoolsRouter from './carpools.js';
import assignmentsRouter from './assignments.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
// 注意：路由顺序很重要，更具体的路由应该放在前面
router.use('/users', usersRouter);
router.use('/card-groups', cardGroupsRouter);
router.use('/card-groups', membersRouter); // Members routes for /card-groups/:groupId/members
router.use('/members', memberDeleteRouter); // DELETE /api/members/:id
// Carpool 和 Assignment 路由需要放在最后，因为它们使用了更复杂的路径模式
router.use('/', carpoolsRouter); // Carpool routes for /card-groups/:groupId/carpools and /carpools/:id
router.use('/', assignmentsRouter); // Assignment routes for /carpools/:carpoolId/assignments

export default router;
