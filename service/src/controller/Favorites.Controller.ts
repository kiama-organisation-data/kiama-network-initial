import { Request, Response } from 'express'
import Favorites, { IFavorite } from '../model/Favorites.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class FavoriteController {

    constructor() { }
    // =========================================================================
    // Add a new favorite
    // =========================================================================
    // @desc    : Add a new favorite
    // @route   : POST /api/v1/favorite
    // @access  : Private
    create(req: Request, res: Response): void {
        Favorites.create(req.body)
            .then(favorite => {
                AppResponse.created(res, favorite);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a favorite
    // =========================================================================
    // @desc    : Update a favorite
    // @route   : PUT /api/v1/favorite/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Favorites.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(favorite => {
                AppResponse.success(res, favorite);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a favorite
    // =========================================================================
    // @desc    : Delete favorite
    // @route   : DELETE /api/v1/favorite/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Favorites.deleteOne({ _id: req.params.id })
            .then(favorite => {
                AppResponse.success(res, favorite);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all favorites
    // =========================================================================
    // @desc    : Get all favorites
    // @route   : GET /api/v1/favorite
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, label, select
    getAll(req: Request, res: Response): void {
        let query;
        Favorites.find(query || {})
            .then(favorite => {
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

                const filteredData = favorite.filter((item) => {
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
    // Get one favorite
    // =========================================================================
    // @desc    : Get one favorite
    // @route   : GET /api/v1/favorite/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Favorites.findOne({ _id: req.params.id })
            .then(favorite => {
                AppResponse.success(res, favorite);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const favoritesController = new FavoriteController()

export default favoritesController




