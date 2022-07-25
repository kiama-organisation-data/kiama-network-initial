import { Request, Response } from 'express'
import Medals, { IMedal } from '../model/Medals.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class MedalController {

    constructor() { }
    // =========================================================================
    // Add a new medal
    // =========================================================================
    // @desc    : Add a new medal
    // @route   : POST /api/v1/medal
    // @access  : Private
    create(req: Request, res: Response): void {
        Medals.create(req.body)
            .then(medal => {
                AppResponse.created(res, medal);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a medal
    // =========================================================================
    // @desc    : Update a medal
    // @route   : PUT /api/v1/medal/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Medals.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(medal => {
                AppResponse.success(res, medal);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a medal
    // =========================================================================
    // @desc    : Delete medal
    // @route   : DELETE /api/v1/medal/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Medals.deleteOne({ _id: req.params.id })
            .then(medal => {
                AppResponse.success(res, medal);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all medals
    // =========================================================================
    // @desc    : Get all medals
    // @route   : GET /api/v1/medal
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, label, select
    getAll(req: Request, res: Response): void {
        let query;
        Medals.find(query || {})
            .then(medal => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    label = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = medal.filter((item) => {
                    return (
                        // search
                        (
                            item.label.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.label.toString() === (label.toString() || item.label.toString())
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
    // Get one medal
    // =========================================================================
    // @desc    : Get one medal
    // @route   : GET /api/v1/medal/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Medals.findOne({ _id: req.params.id })
            .then(medal => {
                AppResponse.success(res, medal);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const medalsController = new MedalController()

export default medalsController




