import { Request, Response } from 'express'
import Projects, { IProject } from '../model/Projects.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class ProjectController {

    constructor() { }
    // =========================================================================
    // Add a new project
    // =========================================================================
    // @desc    : Add a new project
    // @route   : POST /api/v1/project
    // @access  : Private
    create(req: Request, res: Response): void {
        Projects.create(req.body)
            .then(project => {
                AppResponse.created(res, project);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a project
    // =========================================================================
    // @desc    : Update a project
    // @route   : PUT /api/v1/project/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Projects.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(project => {
                AppResponse.success(res, project);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a project
    // =========================================================================
    // @desc    : Delete project
    // @route   : DELETE /api/v1/project/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Projects.deleteOne({ _id: req.params.id })
            .then(project => {
                AppResponse.success(res, project);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all projects
    // =========================================================================
    // @desc    : Get all projects
    // @route   : GET /api/v1/project
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Projects.find(query || {})
            .then(project => {
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

                const filteredData = project.filter((item) => {
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
    // Get one project
    // =========================================================================
    // @desc    : Get one project
    // @route   : GET /api/v1/project/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Projects.findOne({ _id: req.params.id })
            .then(project => {
                AppResponse.success(res, project);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const projectsController = new ProjectController()

export default projectsController




