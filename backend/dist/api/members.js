import { Router } from 'express';
import { memberService } from '../services/MemberService.js';
const router = Router();
/**
 * POST /api/card-groups/:groupId/members
 * 添加成员到卡组
 */
router.post('/:groupId/members', (req, res, next) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const data = req.body;
        const member = memberService.create(groupId, data);
        res.status(201).json({ data: member });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * POST /api/card-groups/:groupId/members/bulk
 * 批量添加成员（cortis预设）
 */
router.post('/:groupId/members/bulk', (req, res, next) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const data = req.body;
        const members = memberService.bulkCreate(groupId, data);
        res.status(201).json({ data: members });
    }
    catch (error) {
        return next(error);
    }
});
/**
 * GET /api/card-groups/:groupId/members
 * 获取卡组的成员列表
 */
router.get('/:groupId/members', (req, res, next) => {
    try {
        const groupId = parseInt(req.params.groupId, 10);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: 'Invalid card group ID' });
        }
        const members = memberService.getByCardGroup(groupId);
        res.json({ data: members });
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=members.js.map