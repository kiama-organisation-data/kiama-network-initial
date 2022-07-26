import { Request, Response } from 'express'
import Comments, { IComment } from '../model/Comments.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class CommentController {

    constructor() { }
    // =========================================================================
    // Add a new comment
    // =========================================================================
    // @desc    : Add a new comment
    // @route   : POST /api/v1/comment
    // @access  : Private
    create(req: Request, res: Response): void {
        Comments.create(req.body)
            .then(comment => {
                AppResponse.created(res, comment);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a comment
    // =========================================================================
    // @desc    : Update a comment
    // @route   : PUT /api/v1/comment/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Comments.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(comment => {
                AppResponse.success(res, comment);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a comment
    // =========================================================================
    // @desc    : Delete comment
    // @route   : DELETE /api/v1/comment/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Comments.deleteOne({ _id: req.params.id })
            .then(comment => {
                AppResponse.success(res, comment);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all comments
    // =========================================================================
    // @desc    : Get all comments
    // @route   : GET /api/v1/comment
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, postId, select
    getAll(req: Request, res: Response): void {
        let query;
        Comments.find(query || {})
            .then(comment => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    postId = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = comment.filter((item) => {
                    return (
                        // search
                        (
                            item.postId.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.postId.toString() === (postId.toString() || item.postId.toString())
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
    // Get one comment
    // =========================================================================
    // @desc    : Get one comment
    // @route   : GET /api/v1/comment/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Comments.findOne({ _id: req.params.id })
            .then(comment => {
                AppResponse.success(res, comment);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const commentsController = new CommentController()

export default commentsController




