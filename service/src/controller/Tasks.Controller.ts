import { Request, Response } from 'express'
import Tasks, { ITask } from '../model/Tasks.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class TaskController {

    constructor() { }
    // =========================================================================
    // Add a new task
    // =========================================================================
    // @desc    : Add a new task
    // @route   : POST /api/v1/task
    // @access  : Private
    create(req: Request, res: Response): void {
        Tasks.create(req.body)
            .then(task => {
                AppResponse.created(res, task);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a task
    // =========================================================================
    // @desc    : Update a task
    // @route   : PUT /api/v1/task/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Tasks.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(task => {
                AppResponse.success(res, task);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a task
    // =========================================================================
    // @desc    : Delete task
    // @route   : DELETE /api/v1/task/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Tasks.deleteOne({ _id: req.params.id })
            .then(task => {
                AppResponse.success(res, task);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all tasks
    // =========================================================================
    // @desc    : Get all tasks
    // @route   : GET /api/v1/task
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Tasks.find(query || {})
            .then(task => {
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

                const filteredData = task.filter((item) => {
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
    // Get one task
    // =========================================================================
    // @desc    : Get one task
    // @route   : GET /api/v1/task/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Tasks.findOne({ _id: req.params.id })
            .then(task => {
                AppResponse.success(res, task);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const tasksController = new TaskController()

export default tasksController




