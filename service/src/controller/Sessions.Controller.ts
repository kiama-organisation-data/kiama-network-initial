import { Request, Response } from 'express'
import Sessions, { ISession } from '../model/Sessions.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class SessionController {

    constructor() { }
    // =========================================================================
    // Add a new session
    // =========================================================================
    // @desc    : Add a new session
    // @route   : POST /api/v1/session
    // @access  : Private
    create(req: Request, res: Response): void {
        Sessions.create(req.body)
            .then(session => {
                AppResponse.created(res, session);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a session
    // =========================================================================
    // @desc    : Update a session
    // @route   : PUT /api/v1/session/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Sessions.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(session => {
                AppResponse.success(res, session);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a session
    // =========================================================================
    // @desc    : Delete session
    // @route   : DELETE /api/v1/session/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Sessions.deleteOne({ _id: req.params.id })
            .then(session => {
                AppResponse.success(res, session);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all sessions
    // =========================================================================
    // @desc    : Get all sessions
    // @route   : GET /api/v1/session
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, user, select
    getAll(req: Request, res: Response): void {
        let query;
        Sessions.find(query || {})
            .then(session => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    user = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = session.filter((item) => {
                    return (
                        // search
                        (
                            item.user.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.user.toString() === (user.toString() || item.user.toString())
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
    // Get one session
    // =========================================================================
    // @desc    : Get one session
    // @route   : GET /api/v1/session/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Sessions.findOne({ _id: req.params.id })
            .then(session => {
                AppResponse.success(res, session);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const sessionsController = new SessionController()

export default sessionsController




