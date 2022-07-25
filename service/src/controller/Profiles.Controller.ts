import { Request, Response } from 'express'
import Profiles, { IProfile } from '../model/Profiles.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class ProfileController {

    constructor() { }
    // =========================================================================
    // Add a new profile
    // =========================================================================
    // @desc    : Add a new profile
    // @route   : POST /api/v1/profile
    // @access  : Private
    create(req: Request, res: Response): void {
        Profiles.create(req.body)
            .then(profile => {
                AppResponse.created(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a profile
    // =========================================================================
    // @desc    : Update a profile
    // @route   : PUT /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Profiles.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a profile
    // =========================================================================
    // @desc    : Delete profile
    // @route   : DELETE /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Profiles.deleteOne({ _id: req.params.id })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all profiles
    // =========================================================================
    // @desc    : Get all profiles
    // @route   : GET /api/v1/profile
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, user, select
    getAll(req: Request, res: Response): void {
        let query;
        Profiles.find(query || {})
            .then(profile => {
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

                const filteredData = profile.filter((item) => {
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
    // Get one profile
    // =========================================================================
    // @desc    : Get one profile
    // @route   : GET /api/v1/profile/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Profiles.findOne({ _id: req.params.id })
            .then(profile => {
                AppResponse.success(res, profile);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const profilesController = new ProfileController()

export default profilesController




