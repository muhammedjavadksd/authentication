

let authMiddleware = {


    isUserLogged: (req, res, next) => {
        next()
    },


    isAdminLogged: (req, res, next) => {
        next()
    },

    isOrganizationLogged: (req, res) => {
        next()
    }
}

module.exports = authMiddleware;