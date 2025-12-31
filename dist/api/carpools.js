import { Router } from 'express';
import { carpoolService } from '../services/CarpoolService.js';
const router = Router();
/**
 * POST /api/card-groups/:groupId/carpools
 * 创建拼车
 */
router.post('/card-groups/:groupId/carpools', (req, res, next) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const data = req.body;
        const carpool = carpoolService.create(groupId, data);
        res.status(201).json({ data: carpool });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/card-groups/:groupId/carpools
 * 获取卡组的拼车列表（按规则排序）
 */
router.get('/card-groups/:groupId/carpools', (req, res, next) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const status = req.query.status;
        const carpools = carpoolService.getByCardGroup(groupId, status);
        res.json({ data: carpools, total: carpools.length });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/carpools/:id
 * 获取拼车详情（包含所有分配）
 */
router.get('/carpools/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid carpool ID' });
        }
        const carpool = carpoolService.getWithAssignments(id);
        res.json({ data: carpool });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * PATCH /api/carpools/:id
 * 更新拼车状态（开车、炸车、扫尾）
 */
router.patch('/carpools/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid carpool ID' });
        }
        const data = req.body;
        // 预留权限功能：ownerId可选，暂时不强制
        const ownerId = req.body.owner_id ? parseInt(req.body.owner_id, 10) : null;
        const carpool = carpoolService.updateStatus(id, data, ownerId);
        res.json({ data: carpool });
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=carpools.js.map