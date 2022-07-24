import { Request, Response } from 'express'
import Languages, { ILanguage } from '../model/Languages.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class LanguageController {

    constructor() { }
    // =========================================================================
    // Add a new language
    // =========================================================================
    // @desc    : Add a new language
    // @route   : POST /api/v1/language
    // @access  : Private
    create(req: Request, res: Response): void {
        Languages.create(req.body)
            .then(language => {
                AppResponse.created(res, language);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a language
    // =========================================================================
    // @desc    : Update a language
    // @route   : PUT /api/v1/language/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Languages.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(language => {
                AppResponse.success(res, language);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a language
    // =========================================================================
    // @desc    : Delete language
    // @route   : DELETE /api/v1/language/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Languages.deleteOne({ _id: req.params.id })
            .then(language => {
                AppResponse.success(res, language);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all languages
    // =========================================================================
    // @desc    : Get all languages
    // @route   : GET /api/v1/language
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, key, select
    getAll(req: Request, res: Response): void {
        let query;
        Languages.find(query || {})
            .then(language => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    key = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = language.filter((item) => {
                    return (
                        // search
                        (
                            item.key.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.key.toString() === (key.toString() || item.key.toString())
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
    // Get one language
    // =========================================================================
    // @desc    : Get one language
    // @route   : GET /api/v1/language/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Languages.findOne({ _id: req.params.id })
            .then(language => {
                AppResponse.success(res, language);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const languagesController = new LanguageController()

export default languagesController




