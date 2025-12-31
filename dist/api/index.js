import { Router } from 'express';
import cardGroupsRouter from './cardGroups.js';
import membersRouter from './members.js';
import usersRouter from './users.js';
import memberDeleteRouter from './memberDelete.js';
const router = Router();
// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// API routes
router.use('/users', usersRouter);
router.use('/card-groups', cardGroupsRouter);
router.use('/card-groups', membersRouter); // Members routes for /card-groups/:groupId/members
router.use('/members', memberDeleteRouter); // DELETE /api/members/:id
export default router;
//# sourceMappingURL=index.js.map