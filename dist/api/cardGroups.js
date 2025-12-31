import { Router } from 'express';
import { cardGroupService } from '../services/CardGroupService.js';
const router = Router();
/**
 * POST /api/card-groups
 * 创建卡组
 */
router.post('/', (req, res, next) => {
    try {
        const data = req.body;
        const cardGroup = cardGroupService.create(data);
        res.status(201).json({ data: cardGroup });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/card-groups
 * 获取卡组列表
 */
router.get('/', (req, res, next) => {
    try {
        const ownerId = req.query.owner_id ? parseInt(req.query.owner_id, 10) : undefined;
        const cardGroups = cardGroupService.getAll(ownerId);
        res.json({ data: cardGroups, total: cardGroups.length });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/card-groups/:id
 * 获取卡组详情（包含成员）
 */
router.get('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const cardGroup = cardGroupService.getWithMembers(id);
        res.json({ data: cardGroup });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * PUT /api/card-groups/:id
 * 更新卡组
 */
router.put('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const data = req.body;
        const cardGroup = cardGroupService.update(id, data);
        res.json({ data: cardGroup });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * DELETE /api/card-groups/:id
 * 删除卡组
 */
router.delete('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        cardGroupService.delete(id);
        res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=cardGroups.js.map