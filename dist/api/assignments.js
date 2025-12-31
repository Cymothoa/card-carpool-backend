import { Router } from 'express';
import { memberAssignmentService } from '../services/MemberAssignmentService.js';
const router = Router();
/**
 * POST /api/carpools/:carpoolId/assignments
 * 分配成员（加入拼车或挤车）
 */
router.post('/carpools/:carpoolId/assignments', (req, res, next) => {
    try {
        const carpoolId = parseInt(req.params.carpoolId, 10);
        if (isNaN(carpoolId)) {
            return res.status(400).json({ error: 'Invalid carpool ID' });
        }
        const data = req.body;
        const result = memberAssignmentService.create(carpoolId, data);
        res.status(201).json({
            data: result.assignment,
            replaced: result.replaced,
            replaced_user_ids: result.replaced_user_ids,
        });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/carpools/:carpoolId/assignments
 * 获取拼车的成员分配列表
 */
router.get('/carpools/:carpoolId/assignments', (req, res, next) => {
    try {
        const carpoolId = parseInt(req.params.carpoolId, 10);
        if (isNaN(carpoolId)) {
            return res.status(400).json({ error: 'Invalid carpool ID' });
        }
        const activeOnly = req.query.active_only !== 'false'; // 默认只返回活跃分配
        const assignments = memberAssignmentService.getByCarpool(carpoolId, activeOnly);
        res.json({ data: assignments, total: assignments.length });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * DELETE /api/carpools/:carpoolId/assignments/:assignmentId
 * 取消分配（退出拼车）
 */
router.delete('/carpools/:carpoolId/assignments/:assignmentId', (req, res, next) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId, 10);
        if (isNaN(assignmentId)) {
            return res.status(400).json({ error: 'Invalid assignment ID' });
        }
        memberAssignmentService.delete(assignmentId);
        res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=assignments.js.map