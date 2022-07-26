import { Request, Response } from 'express'
import Collaborators, { ICollaborator } from '../model/Collaborators.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class CollaboratorController {

    constructor() { }
    // =========================================================================
    // Add a new collaborator
    // =========================================================================
    // @desc    : Add a new collaborator
    // @route   : POST /api/v1/collaborator
    // @access  : Private
    create(req: Request, res: Response): void {
        Collaborators.create(req.body)
            .then(collaborator => {
                AppResponse.created(res, collaborator);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a collaborator
    // =========================================================================
    // @desc    : Update a collaborator
    // @route   : PUT /api/v1/collaborator/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Collaborators.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(collaborator => {
                AppResponse.success(res, collaborator);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a collaborator
    // =========================================================================
    // @desc    : Delete collaborator
    // @route   : DELETE /api/v1/collaborator/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Collaborators.deleteOne({ _id: req.params.id })
            .then(collaborator => {
                AppResponse.success(res, collaborator);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all collaborators
    // =========================================================================
    // @desc    : Get all collaborators
    // @route   : GET /api/v1/collaborator
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, status, select
    getAll(req: Request, res: Response): void {
        let query;
        Collaborators.find(query || {})
            .then(collaborator => {
                const {
                    search = "",
                    perPage = 10,
                    page = 1,
                    sortBy = "createdAt",
                    sortDesc = false,
                    collab = "",
                    select = "all",
                } = req.query;

                const queryLowered = search.toLowerCase();

                const filteredData = collaborator.filter((item) => {
                    return (
                        // search
                        (
                            item.collaborator.toLowerCase().includes(queryLowered)
                        )
                        &&
                        // Filter
                        item.collaborator.toString() === (collab.toString() || item.collaborator.toString())
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
    // Get one collaborator
    // =========================================================================
    // @desc    : Get one collaborator
    // @route   : GET /api/v1/collaborator/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Collaborators.findOne({ _id: req.params.id })
            .then(collaborator => {
                AppResponse.success(res, collaborator);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const collaboratorsController = new CollaboratorController()

export default collaboratorsController




