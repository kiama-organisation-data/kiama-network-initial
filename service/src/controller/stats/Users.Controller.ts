import Users, { IUser } from '../../model/users/UsersAuth.Model';
import { Request, Response } from 'express'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";
import moment from 'moment'

class UsersStatController {

    constructor() { }
    // =========================================================================
    // count new users per day
    // =========================================================================
    // @desc    : count new users per day
    // @route   : POST /api/v1/user/stats/new-per-day
    // @access  : Private
    countNewUserPerDay(req: Request, res: Response): void {
        Users.aggregate([
            {
                "$group": {
                    _id: {
                        "$subtract": [
                            { "$subtract": ["$createdAt", new Date("1970-01-01")] },
                            {
                                "$mod": [
                                    { "$subtract": ["$createdAt", new Date("1970-01-01")] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        ]
                    },
                    count: { $sum: 1 }
                }
            },
            {
                "$project": {
                    timestamp: {
                        $dateToString: { date: { $add: [new Date(0), "$_id"] }, format: "%Y-%m-%d" }
                    },
                    count: '$count'
                }
            }
        ])
            .exec()
            .then((body: any) => {
                let now = moment()
                let value = new Array(7)

                for (let d = 6; d >= 0; d--) {
                    let c = body.filter((b: any) => b.timestamp === now.format('YYYY-MM-DD'))[0]
                    value[d] = {
                        timestamp: now.format('YYYY-MM-DD'),
                        count: c ? c.count : 0
                    }
                    now.subtract(1, 'days')
                }
                res.json({ success: true, body: value })
            })
            .catch((err: any) => {
                res.json({ success: false, message: err })
            })
    }
}

const usersstatsController = new UsersStatController()

export default usersstatsController




