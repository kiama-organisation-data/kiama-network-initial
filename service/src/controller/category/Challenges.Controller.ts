import { Request, Response } from 'express'
import Challenges, { ICatChallenge } from '../../model/category/Challenges.Model'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";

class ChallengeController {

    constructor() { }
    // =========================================================================
    // Add a new challenge
    // =========================================================================
    // @desc    : Add a new challenge
    // @route   : POST /api/v1/challenge
    // @access  : Private
    create(req: Request, res: Response): void {
        Challenges.create(req.body)
            .then(challenge => {
                AppResponse.created(res, challenge);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a challenge
    // =========================================================================
    // @desc    : Update a challenge
    // @route   : PUT /api/v1/challenge/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Challenges.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(challenge => {
                AppResponse.success(res, challenge);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a challenge
    // =========================================================================
    // @desc    : Delete challenge
    // @route   : DELETE /api/v1/challenge/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Challenges.deleteOne({ _id: req.params.id })
            .then(challenge => {
                AppResponse.success(res, challenge);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all challenges
    // =========================================================================
    // @desc    : Get all challenges
    // @route   : GET /api/v1/challenge
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Challenges.find(query || {})
            .then(challenge => {
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

                const filteredData = challenge.filter((item) => {
                    return (
                        // search
                        (
                            item.label.toLowerCase().includes(queryLowered)
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
    // Get one challenge
    // =========================================================================
    // @desc    : Get one challenge
    // @route   : GET /api/v1/challenge/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Challenges.findOne({ _id: req.params.id })
            .then(challenge => {
                AppResponse.success(res, challenge);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const challengesController = new ChallengeController()

export default challengesController




