import { Request, Response } from 'express'
import Statistics, { IStatistic } from '../model/Statistics.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class StatisticController {

    constructor() { }
    // =========================================================================
    // Add a new statistic
    // =========================================================================
    // @desc    : Add a new statistic
    // @route   : POST /api/v1/statistic
    // @access  : Private
    create(req: Request, res: Response): void {
        Statistics.create(req.body)
            .then(statistic => {
                AppResponse.created(res, statistic);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a statistic
    // =========================================================================
    // @desc    : Update a statistic
    // @route   : PUT /api/v1/statistic/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Statistics.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(statistic => {
                AppResponse.success(res, statistic);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a statistic
    // =========================================================================
    // @desc    : Delete statistic
    // @route   : DELETE /api/v1/statistic/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Statistics.deleteOne({ _id: req.params.id })
            .then(statistic => {
                AppResponse.success(res, statistic);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all statistics
    // =========================================================================
    // @desc    : Get all statistics
    // @route   : GET /api/v1/statistic
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, name, select
    getAll(req: Request, res: Response): void {
        let query;
        Statistics.find(query || {})
            .then(statistic => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    name = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = statistic.filter((item) => {
                    return (
                        // search
                        (
                            item.name.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.name.toString() === (name.toString() || item.name.toString())
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
    // Get one statistic
    // =========================================================================
    // @desc    : Get one statistic
    // @route   : GET /api/v1/statistic/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Statistics.findOne({ _id: req.params.id })
            .then(statistic => {
                AppResponse.success(res, statistic);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const statisticsController = new StatisticController()

export default statisticsController




