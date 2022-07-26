import { Request, Response } from 'express'
import Orientations, { IOrientation } from '../model/Orientations.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class OrientationController {

    constructor() { }
    // =========================================================================
    // Add a new orientation
    // =========================================================================
    // @desc    : Add a new orientation
    // @route   : POST /api/v1/orientation
    // @access  : Private
    create(req: Request, res: Response): void {
        Orientations.create(req.body)
            .then(orientation => {
                AppResponse.created(res, orientation);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a orientation
    // =========================================================================
    // @desc    : Update a orientation
    // @route   : PUT /api/v1/orientation/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Orientations.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(orientation => {
                AppResponse.success(res, orientation);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a orientation
    // =========================================================================
    // @desc    : Delete orientation
    // @route   : DELETE /api/v1/orientation/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Orientations.deleteOne({ _id: req.params.id })
            .then(orientation => {
                AppResponse.success(res, orientation);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all orientations
    // =========================================================================
    // @desc    : Get all orientations
    // @route   : GET /api/v1/orientation
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, name, select
    getAll(req: Request, res: Response): void {
        let query;
        Orientations.find(query || {})
            .then(orientation => {
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

                const filteredData = orientation.filter((item) => {
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
    // Get one orientation
    // =========================================================================
    // @desc    : Get one orientation
    // @route   : GET /api/v1/orientation/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Orientations.findOne({ _id: req.params.id })
            .then(orientation => {
                AppResponse.success(res, orientation);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const orientationsController = new OrientationController()

export default orientationsController




