import { Request, Response } from 'express'
import FriendReqs, { IFriendReq } from '../model/FriendReqs.Model'
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
}

const friendreqsController = new FriendReqController()

export default friendreqsController




