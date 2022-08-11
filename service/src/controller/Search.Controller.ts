import { Request, Response } from 'express'
import Users, { IUser } from '../model/UsersAuth.Model'
import FriendReqs, { IFriendReq } from '../model/FriendReqs.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

import userServices from "../services/User.Services";

class SearchController {

    constructor() { }
    // =========================================================================
    // SEARCH FOR PEOPLE TO FRIEND
    // =========================================================================
    // @desc    : Search for people to friend
    // @route   : GET /api/v1/search/:search
    // @access  : Private
    // @param   : id
    searchPeople(req: any, res: Response, next: any): void {
        const search = req.query.search || '';
        const userID = req.user;

        Users.findOne({ _id: userID }).then((user: any) => {
            FriendReqs.find({ $or: [{ fromUserId: user._id }, { toUserId: user._id }] }).then((fr) => {
                userServices.getUserBlocked(userID).then((blocked: any) => {
                    Users.find(
                        {
                            $and: [
                                { _id: { $nin: user.friends, $ne: user._id } },
                                { _id: { $nin: blocked } },
                            ],
                            friendRequests: { $nin: fr },
                            $or: [
                                { 'name.first': new RegExp(search, 'i') },
                                { 'name.last': new RegExp(search, 'i') },
                            ],
                        },
                        'name.first name.last',
                    )
                        .limit(Number(req.query.limit))
                        .lean()
                        .then((people) => {
                        }).catch((error) => {
                            AppResponse.fail(res, error);
                        })
                })
            }
            ).catch((error) => {
                AppResponse.fail(res, error);
            }
            );
        }
        ).catch((error) => {
            AppResponse.fail(res, error);
        });
    }
}

const searchsController = new SearchController()

export default searchsController




