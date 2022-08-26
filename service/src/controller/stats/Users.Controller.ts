import Users, { IUser } from '../../model/users/UsersAuth.Model';
import { Request, Response } from 'express'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";
import moment from 'moment'
import _ from 'underscore'

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

    // =========================================================================
    // count new users weekly and monthly or group by date 
    // =========================================================================
    // @desc    : count new users weekly and monthly or group by date 
    // @route   : POST /api/v1/user/stats/charts
    // @access  : Private
    async getStatChartUser(req: Request, res: Response) {
        let startOfWeek = moment()
            .startOf("week")
            .add(1, "day")
            .startOf("day")
            .valueOf();
        let endOfWeek = moment()
            .endOf("week")
            .add(1, "day")
            .startOf("day")
            .valueOf();
        console.log("startofweek", startOfWeek);
        console.log("endofweek", endOfWeek);
        let startOfMonth = moment()
            .startOf("month")
            .startOf("day")
            .valueOf();
        let endOfMonth = moment()
            .endOf("month")
            .startOf("day")
            .valueOf();
        // console.log("startOfMonth", startOfMonth, "endOfMonth", endOfMonth);

        let weeklyUser = await Users.find(
            {
                $and: [
                    { createdAt: { $gte: startOfWeek } },
                    { createdAt: { $lte: endOfWeek } }
                ]
            },
            "createdAt"
        );
        let monthlyUser = await Users.find(
            {
                $and: [
                    { createdAt: { $gte: startOfMonth } },
                    { createdAt: { $lte: endOfMonth } }]
            },
            "createdAt"
        );

        console.log("weeklyUser", weeklyUser, "monthlyUser", monthlyUser);

        try {
            let temp = [0, 0, 0, 0, 0, 0, 0]; // ["Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday", "Sunday"]
            for (let i = 0; i < 7; i++) {
                weeklyUser.forEach((user: any) => {
                    if (
                        user.createdAt > moment(startOfWeek).add(i, "day") &&
                        user.createdAt < moment(startOfWeek).add(i + 1, "day")
                    ) {
                        temp[i] = temp[i] + 1;
                    }
                });
            }
            console.log("monthlyUser", monthlyUser);

            let date = []
            for (let i = 0; i < moment().endOf("month").date(); i++) {
                date[i] = 0
            }
            console.log("date", date);
            let groupBy = _.groupBy(monthlyUser, (user: any) => {
                return moment(user.createdAt).date()
            })
            console.log("groupby", groupBy);

            let temp1 = _.mapObject(groupBy, function (val: any, key: string) {
                return val.length;
            })
            console.log("temp1", temp1);

            Object.keys(temp1).forEach((key: any) => {
                date[key - 1] = temp1[key]
            })

            // AppResponse.success(res, { weeklyUsers: temp, monthlyUsers: date });
            res.json({ success: true, weeklyUsers: temp, monthlyUsers: date, groupBy })

        } catch (error) {
            AppResponse.fail(res, error);
        }
    }
}

const usersstatsController = new UsersStatController()

export default usersstatsController




