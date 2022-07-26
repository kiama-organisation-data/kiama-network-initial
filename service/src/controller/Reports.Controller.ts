import { Request, Response } from 'express'
import Reports, { IReport } from '../model/Reports.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class ReportController {

    constructor() { }
    // =========================================================================
    // Add a new report
    // =========================================================================
    // @desc    : Add a new report
    // @route   : POST /api/v1/report
    // @access  : Private
    create(req: Request, res: Response): void {
        Reports.create(req.body)
            .then(report => {
                AppResponse.created(res, report);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a report
    // =========================================================================
    // @desc    : Update a report
    // @route   : PUT /api/v1/report/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Reports.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(report => {
                AppResponse.success(res, report);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a report
    // =========================================================================
    // @desc    : Delete report
    // @route   : DELETE /api/v1/report/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Reports.deleteOne({ _id: req.params.id })
            .then(report => {
                AppResponse.success(res, report);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all reports
    // =========================================================================
    // @desc    : Get all reports
    // @route   : GET /api/v1/report
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Reports.find(query || {})
            .then(report => {
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

                const filteredData = report.filter((item) => {
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
    // Get one report
    // =========================================================================
    // @desc    : Get one report
    // @route   : GET /api/v1/report/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Reports.findOne({ _id: req.params.id })
            .then(report => {
                AppResponse.success(res, report);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const reportsController = new ReportController()

export default reportsController




