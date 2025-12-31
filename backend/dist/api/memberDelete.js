import { Router } from 'express';
import { memberService } from '../services/MemberService.js';
const router = Router();
/**
 * DELETE /api/members/:id
 * 删除成员
 */
router.delete('/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid member ID' });
        }
        memberService.delete(id);
        res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
//# sourceMappingURL=memberDelete.js.map