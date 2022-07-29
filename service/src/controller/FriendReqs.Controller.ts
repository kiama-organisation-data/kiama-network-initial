import { Request, Response } from 'express'
import FriendReqs, { IFriendReq } from '../model/FriendReqs.Model'
import Users, { IUser } from '../model/UsersAuth.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class FriendReqController {

    constructor() { }
    // =========================================================================
    // Add a new friendreq
    // =========================================================================
    // @desc    : Add a new friendreq
    // @route   : POST /api/v1/friendreq
    // @access  : Private
    create(req: Request, res: Response): void {
        FriendReqs.create(req.body)
            .then(friendreq => {
                AppResponse.created(res, friendreq);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a friendreq
    // =========================================================================
    // @desc    : Update a friendreq
    // @route   : PUT /api/v1/friendreq/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        FriendReqs.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(friendreq => {
                AppResponse.success(res, friendreq);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a friendreq
    // =========================================================================
    // @desc    : Delete friendreq
    // @route   : DELETE /api/v1/friendreq/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        FriendReqs.deleteOne({ _id: req.params.id })
            .then(friendreq => {
                AppResponse.success(res, friendreq);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all friendreqs
    // =========================================================================
    // @desc    : Get all friendreqs
    // @route   : GET /api/v1/friendreq
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        FriendReqs.find(query || {})
            .then(friendreq => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    status = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = friendreq.filter((item) => {
                    return (
                        // search
                        (
                            item.status.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.status.toString() === (status.toString() || item.status.toString())
                    );
                });

                const sortedData = filteredData.sort(sortData.sortCompare(sortBy));
                if (sortDesc === "true") {
                    sortedData.reverse();
                }

                // result to show
                const dataFinal = sortData.selectFields(sortedData, select);
                AppResponse.success(res, sortData.paginateArray(dataFinal, perPage, page), filteredData.length);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get one friendreq
    // =========================================================================
    // @desc    : Get one friendreq
    // @route   : GET /api/v1/friendreq/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        FriendReqs.findOne({ _id: req.params.id })
            .then(friendreq => {
                AppResponse.success(res, friendreq);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // SEND A FRIEND REQUEST
    // =========================================================================
    // @desc    : Send a friendreq
    // @route   : POST /api/v1/friendreq/send/:toUserID
    // @access  : Private
    // @param   : id
    sendFriendReq(req: any, res: Response): void {
        const toUserID = req.params.toUserID;
        const fromUserID = req.user;
        if (req.user === toUserID) {
            AppResponse.fail(res, "You can't send friend request to yourself");
        } else {
            FriendReqs.findOne(
                {
                    $or: [
                        { status: "pending", toUserId: toUserID, fromUserId: fromUserID },
                        { status: "accepted", toUserId: toUserID, fromUserId: fromUserID },
                        { status: "blocked", toUserId: toUserID, fromUserId: fromUserID },
                    ]
                }
            )
                .then(friendreq => {
                    if (friendreq?.status === "pending") {
                        AppResponse.fail(res, "Friend request already sent");
                    } else {
                        if (friendreq?.status === "accepted") {
                            AppResponse.fail(res, "You are already friends");
                        } else {
                            if (friendreq?.status === "blocked") {
                                AppResponse.fail(res, "You are blocked");
                            } else {
                                // verify if the user is already friends
                                Users.findOne({ _id: toUserID })
                                    .then(user => {
                                        if (user?.friends?.includes(fromUserID)) {
                                            AppResponse.fail(res, "You are already friends");
                                        } else {
                                            const newFriend = new FriendReqs({
                                                status: 'pending',
                                                fromUserId: fromUserID,
                                                toUserId: toUserID,
                                            })
                                            newFriend.save().then((sentFriend) => {
                                                Users.findByIdAndUpdate(toUserID, { $push: { friendRequests: sentFriend } })
                                                    .then((updatedUser) => {
                                                        Users.findByIdAndUpdate(fromUserID, { $push: { friendRequests: sentFriend } }).then(
                                                            (updatedUser2) => {
                                                                AppResponse.success(res, sentFriend);
                                                            },
                                                        );
                                                    })
                                                    .catch((err) => {
                                                        AppResponse.fail(res, err);
                                                    });
                                            });
                                        }
                                    })
                                    .catch((err) => {
                                        AppResponse.fail(res, err);
                                    })
                            }
                        }
                    }
                }).catch(err => {
                    AppResponse.fail(res, err);
                });
        }

    }

    // =========================================================================
    // ACCEPT A FRIEND REQUEST
    // =========================================================================
    // @desc    : Accept a friendreq
    // @route   : PUT /api/v1/friendreq/accept/:toUserID
    // @access  : Private
    // @param   : id
    acceptFriendReq(req: any, res: Response): void {
        const fromUserID = req.params.fromUserID;
        const toUserID = req.user;
        FriendReqs.findOne(
            { status: "pending", toUserId: toUserID, fromUserId: fromUserID }
        ).then(friendreq => {
            if (friendreq?.status === "pending") {
                FriendReqs.findOneAndUpdate(
                    { status: 'pending', fromUserId: fromUserID, toUserId: toUserID },
                    { status: 'accepted' },
                    { new: true },
                ).then((friendreq) => {
                    Users.findByIdAndUpdate(fromUserID, { $push: { friends: toUserID } }).then((sender) => {
                        Users.findByIdAndUpdate(toUserID, { $push: { friends: fromUserID } })
                            .then((receiver) => {
                                AppResponse.success(res, "Friend request accepted");
                            })
                            .catch((err) => {
                                AppResponse.fail(res, err);
                            });
                    });
                }).catch(err => {
                    AppResponse.fail(res, err);
                });
            } else {
                AppResponse.fail(res, "Friend request already accepted");
            }
        }).catch(err => {
            AppResponse.fail(res, err);
        });
    }

    // =========================================================================
    // DECLINE A FRIEND REQUEST
    // =========================================================================
    // @desc    : Decline a friendreq
    // @route   : PUT /api/v1/friendreq/decline/:fromUserID
    // @access  : Private
    // @param   : id
    declineFriendReq(req: any, res: Response): void {
        const fromUserID = req.params.fromUserID;
        const toUserID = req.user;
        FriendReqs.findOneAndDelete({ status: "pending", toUserId: toUserID, fromUserId: fromUserID })
            .then(friendreq => {
                if (friendreq) {
                    AppResponse.success(res, friendreq);
                } else {
                    AppResponse.fail(res, "Friend request already declined");
                }
            }).catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // BLOCK A FRIEND REQUEST
    // =========================================================================
    // @desc    : Block a friendreq
    // @route   : PUT /api/v1/friendreq/block/:fromUserID
    // @access  : Private
    // @param   : id
    blockFriendReq(req: any, res: Response): void {
        const fromUserID = req.params.fromUserID;
        const toUserID = req.user;
        FriendReqs.findOneAndUpdate(
            { status: 'pending', toUserId: toUserID, fromUserId: fromUserID },
            { status: 'blocked' },
            { new: true },
        ).then((friendreq) => {
            console.log(friendreq);
            AppResponse.success(res, "Friend request blocked");
        }).catch(err => {
            AppResponse.fail(res, err);
        });
    }

    // =========================================================================
    // UNBLOCK A FRIEND REQUEST
    // =========================================================================
    // @desc    : Unblock a friendreq
    // @route   : PUT /api/v1/friendreq/unblock/:fromUserID
    // @access  : Private
    // @param   : id
    unblockFriendReq(req: any, res: Response): void {
        const fromUserID = req.params.fromUserID;
        const toUserID = req.user;
        // find and delete blocked friendreq
        FriendReqs.findOneAndDelete({ status: 'blocked', toUserId: toUserID, fromUserId: fromUserID })
            .then(friendreq => {
                if (friendreq) {
                    console.log(friendreq);
                    AppResponse.success(res, "Friend request unblocked");
                } else {
                    AppResponse.fail(res, "Friend request already unblocked");
                }
            }).catch(err => {
                AppResponse.fail(res, err);
            });
    }

}

const friendreqsController = new FriendReqController()

export default friendreqsController




