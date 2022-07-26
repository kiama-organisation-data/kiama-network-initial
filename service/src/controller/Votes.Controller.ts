import { Request, Response } from 'express'
import Votes, { IVote } from '../model/Votes.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class VoteController {

    constructor() { }
    // =========================================================================
    // Add a new vote
    // =========================================================================
    // @desc    : Add a new vote
    // @route   : POST /api/v1/vote
    // @access  : Private
    create(req: Request, res: Response): void {
        Votes.create(req.body)
            .then(vote => {
                AppResponse.created(res, vote);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a vote
    // =========================================================================
    // @desc    : Update a vote
    // @route   : PUT /api/v1/vote/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Votes.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(vote => {
                AppResponse.success(res, vote);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a vote
    // =========================================================================
    // @desc    : Delete vote
    // @route   : DELETE /api/v1/vote/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Votes.deleteOne({ _id: req.params.id })
            .then(vote => {
                AppResponse.success(res, vote);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all votes
    // =========================================================================
    // @desc    : Get all votes
    // @route   : GET /api/v1/vote
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, voteBy, select
    getAll(req: Request, res: Response): void {
        let query;
        Votes.find(query || {})
            .then(vote => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    voteBy = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = vote.filter((item) => {
                    return (
                        // search
                        (
                            item.voteBy.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.voteBy.toString() === (voteBy.toString() || item.voteBy.toString())
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
    // Get one vote
    // =========================================================================
    // @desc    : Get one vote
    // @route   : GET /api/v1/vote/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Votes.findOne({ _id: req.params.id })
            .then(vote => {
                AppResponse.success(res, vote);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const votesController = new VoteController()

export default votesController




