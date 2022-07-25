import { Request, Response } from 'express'
import News, { ICatNew } from '../../model/category/News.Model'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";

class NewController {

    constructor() { }
    // =========================================================================
    // Add a new new
    // =========================================================================
    // @desc    : Add a new new
    // @route   : POST /api/v1/new
    // @access  : Private
    create(req: Request, res: Response): void {
        News.create(req.body)
            .then(news => {
                AppResponse.created(res, news);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a new
    // =========================================================================
    // @desc    : Update a new
    // @route   : PUT /api/v1/new/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        News.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(news => {
                AppResponse.success(res, news);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a new
    // =========================================================================
    // @desc    : Delete new
    // @route   : DELETE /api/v1/new/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        News.deleteOne({ _id: req.params.id })
            .then(news => {
                AppResponse.success(res, news);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all news
    // =========================================================================
    // @desc    : Get all news
    // @route   : GET /api/v1/new
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        News.find(query || {})
            .then(news => {
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

                const filteredData = news.filter((item) => {
                    return (
                        // search
                        (
                            item.name.toLowerCase().includes(queryLowered)
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
    // Get one new
    // =========================================================================
    // @desc    : Get one new
    // @route   : GET /api/v1/new/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        News.findOne({ _id: req.params.id })
            .then(news => {
                AppResponse.success(res, news);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const newsController = new NewController()

export default newsController




