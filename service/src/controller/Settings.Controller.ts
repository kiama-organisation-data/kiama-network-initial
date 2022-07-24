import { Request, Response } from 'express'
import Settings, { ISetting } from '../model/Settings.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class SettingController {

    constructor() { }
    // =========================================================================
    // Add a new setting
    // =========================================================================
    // @desc    : Add a new setting
    // @route   : POST /api/v1/setting
    // @access  : Private
    create(req: Request, res: Response): void {
        Settings.create(req.body)
            .then(setting => {
                AppResponse.created(res, setting);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a setting
    // =========================================================================
    // @desc    : Update a setting
    // @route   : PUT /api/v1/setting/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Settings.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(setting => {
                AppResponse.success(res, setting);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a setting
    // =========================================================================
    // @desc    : Delete setting
    // @route   : DELETE /api/v1/setting/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Settings.deleteOne({ _id: req.params.id })
            .then(setting => {
                AppResponse.success(res, setting);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all settings
    // =========================================================================
    // @desc    : Get all settings
    // @route   : GET /api/v1/setting
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, name, select
    getAll(req: Request, res: Response): void {
        let query;
        Settings.find(query || {})
            .then(setting => {
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

                const filteredData = setting.filter((item) => {
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
    // Get one setting
    // =========================================================================
    // @desc    : Get one setting
    // @route   : GET /api/v1/setting/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Settings.findOne({ _id: req.params.id })
            .then(setting => {
                AppResponse.success(res, setting);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const settingsController = new SettingController()

export default settingsController




