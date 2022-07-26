import { Request, Response } from 'express'
import Countries, { ICountrie } from '../model/Countries.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class CountrieController {

    constructor() { }
    // =========================================================================
    // Add a new countrie
    // =========================================================================
    // @desc    : Add a new countrie
    // @route   : POST /api/v1/countrie
    // @access  : Private
    create(req: Request, res: Response): void {
        Countries.create(req.body)
            .then(countrie => {
                AppResponse.created(res, countrie);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a countrie
    // =========================================================================
    // @desc    : Update a countrie
    // @route   : PUT /api/v1/countrie/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Countries.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(countrie => {
                AppResponse.success(res, countrie);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a countrie
    // =========================================================================
    // @desc    : Delete countrie
    // @route   : DELETE /api/v1/countrie/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Countries.deleteOne({ _id: req.params.id })
            .then(countrie => {
                AppResponse.success(res, countrie);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all countries
    // =========================================================================
    // @desc    : Get all countries
    // @route   : GET /api/v1/countrie
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, name, select
    getAll(req: Request, res: Response): void {
        let query;
        Countries.find(query || {})
            .then(countrie => {
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

                const filteredData = countrie.filter((item) => {
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
    // Get one countrie
    // =========================================================================
    // @desc    : Get one countrie
    // @route   : GET /api/v1/countrie/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Countries.findOne({ _id: req.params.id })
            .then(countrie => {
                AppResponse.success(res, countrie);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const countriesController = new CountrieController()

export default countriesController




