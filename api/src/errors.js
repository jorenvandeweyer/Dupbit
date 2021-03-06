module.exports = async (req, res, next) => {
    res.jsons = async (json) => {
        res.json({
            success: true,
            ...json,
        });
    },
    res.jsonf = async (json) => {
        res.json({
            success: false,
            ...json,
        });
    },
    res.errors = {
        incomplete: () => {
            res.jsonf({
                reason: 'Body Incomplete',
            });
        },
        method: () => {
            res.jsonf({
                reason: 'Method Not Allowed',
            });
        },
        custom: (reason='custom') => {
            res.jsonf({
                reason,
            });
        },
        wrongCredentials: () => {
            res.jsonf({
                reason: 'Wrong Credentials',
            });
        },
        needAuth: () => {
            res.jsonf({
                reason: 'Need to be authenticated',
            });
        },
        expired: () => {
            res.jsonf({
                reason: 'Expired',
            });
        },
        notFound: () => {
            res.jsonf({
                reason: 'Not found',
            });
        },
        failed: () => {
            res.jsonf({
                reason: 'Transaction failed',
            });
        },
        db: (e) => {
            res.jsonf({
                ...e,
                reason: 'Database error',
            });
        }
    };
    req.hasParams = async (...params) => {
        const data = (req.method === 'GET') ? req.query : req.body;

        const missing = [];

        for (let key of params) {
            if (key in data) continue;
            missing.push(key);
        }

        if (missing.length) {
            res.errors.missing(missing);
            return false;
        }

        return true;
    };
    next();
};
