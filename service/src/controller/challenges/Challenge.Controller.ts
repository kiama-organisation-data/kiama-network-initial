import { Request, Response } from 'express'
import ChallengePosts, { IChallengePost } from '../../model/Challenges.Post.Model'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";

class ChallengePostController {

    constructor() { }
    // =========================================================================
    // Add a new challengepost
    // =========================================================================
    // @desc    : Add a new challengepost
    // @route   : POST /api/v1/challengepost
    // @access  : Private
    create(req: Request, res: Response): void {
        ChallengePosts.create(req.body)
            .then(challengepost => {
                AppResponse.created(res, challengepost);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a challengepost
    // =========================================================================
    // @desc    : Update a challengepost
    // @route   : PUT /api/v1/challengepost/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        ChallengePosts.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(challengepost => {
                AppResponse.success(res, challengepost);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a challengepost
    // =========================================================================
    // @desc    : Delete challengepost
    // @route   : DELETE /api/v1/challengepost/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        ChallengePosts.deleteOne({ _id: req.params.id })
            .then(challengepost => {
                AppResponse.success(res, challengepost);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all challengeposts
    // =========================================================================
    // @desc    : Get all challengeposts
    // @route   : GET /api/v1/challengepost
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        ChallengePosts.find(query || {})
            .then(challengepost => {
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

                const filteredData = challengepost.filter((item) => {
                    return (
                        // search
                        (
                            item.title.toLowerCase().includes(queryLowered)
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
    // Get one challengepost
    // =========================================================================
    // @desc    : Get one challengepost
    // @route   : GET /api/v1/challengepost/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        ChallengePosts.findOne({ _id: req.params.id })
            .then(challengepost => {
                AppResponse.success(res, challengepost);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const challengepostsController = new ChallengePostController()

export default challengepostsController




