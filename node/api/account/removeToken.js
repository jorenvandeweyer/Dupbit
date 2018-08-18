const db = require("../../src/util/Database");

module.exports = async (req, res) => {
    const data = req.query;
    if (req.auth.isLoggedIn && data.tid) {
        const result = await db.getToken({tid: data.tid});
        if (result.length) {
            const token = result[0];
            if (token.uid === req.auth.id) {
                await db.removeToken(token.id);
                return res.json({
                    success: true
                });
            }
        }
        res.json({
            success: false,
            reason: "not a token",
        });
    } else {
        res.json({
            success: false,
            reason: "invalid params",
        });
    }
};