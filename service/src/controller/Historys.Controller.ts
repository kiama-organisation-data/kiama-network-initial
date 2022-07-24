import { Request, Response } from 'express'
import Historys, { IHistory } from '../model/Historys.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class HistoryController {

    constructor() { }
    // =========================================================================
    // Add a new history
    // =========================================================================
    // @desc    : Add a new history
    // @route   : POST /api/v1/history
    // @access  : Private
    create(req: Request, res: Response): void {
        Historys.create(req.body)
            .then(history => {
                AppResponse.created(res, history);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a history
    // =========================================================================
    // @desc    : Update a history
    // @route   : PUT /api/v1/history/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Historys.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(history => {
                AppResponse.success(res, history);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a history
    // =========================================================================
    // @desc    : Delete history
    // @route   : DELETE /api/v1/history/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Historys.deleteOne({ _id: req.params.id })
            .then(history => {
                AppResponse.success(res, history);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all historys
    // =========================================================================
    // @desc    : Get all historys
    // @route   : GET /api/v1/history
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, userid, select
    getAll(req: Request, res: Response): void {
        let query;
        Historys.find(query || {})
            .then(history => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    userId = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = history.filter((item) => {
                    return (
                        // search
                        (
                            item.userId.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.userId.toString() === (userId.toString() || item.userId.toString())
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
    // Get one history
    // =========================================================================
    // @desc    : Get one history
    // @route   : GET /api/v1/history/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Historys.findOne({ _id: req.params.id })
            .then(history => {
                AppResponse.success(res, history);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const historysController = new HistoryController()

export default historysController




