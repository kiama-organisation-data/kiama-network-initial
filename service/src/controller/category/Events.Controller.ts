import { Request, Response } from 'express'
import Events, { ICatEvent } from '../../model/category/Events.Model'
import AppResponse from "../../services/index";
import sortData from "../../middleware/utils";

class EventController {

    constructor() { }
    // =========================================================================
    // Add a new event
    // =========================================================================
    // @desc    : Add a new event
    // @route   : POST /api/v1/event
    // @access  : Private
    create(req: Request, res: Response): void {
        Events.create(req.body)
            .then(event => {
                AppResponse.created(res, event);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a event
    // =========================================================================
    // @desc    : Update a event
    // @route   : PUT /api/v1/event/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Events.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(event => {
                AppResponse.success(res, event);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a event
    // =========================================================================
    // @desc    : Delete event
    // @route   : DELETE /api/v1/event/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Events.deleteOne({ _id: req.params.id })
            .then(event => {
                AppResponse.success(res, event);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all events
    // =========================================================================
    // @desc    : Get all events
    // @route   : GET /api/v1/event
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Events.find(query || {})
            .then(event => {
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

                const filteredData = event.filter((item) => {
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
    // Get one event
    // =========================================================================
    // @desc    : Get one event
    // @route   : GET /api/v1/event/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Events.findOne({ _id: req.params.id })
            .then(event => {
                AppResponse.success(res, event);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const eventsController = new EventController()

export default eventsController




