import { Request, Response } from 'express'
import Notifications, { INotification } from '../model/Notifications.Model'
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class NotificationController {

    constructor() { }
    // =========================================================================
    // Add a new notification
    // =========================================================================
    // @desc    : Add a new notification
    // @route   : POST /api/v1/notification
    // @access  : Private
    create(req: Request, res: Response): void {
        Notifications.create(req.body)
            .then(notification => {
                AppResponse.created(res, notification);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // update a notification
    // =========================================================================
    // @desc    : Update a notification
    // @route   : PUT /api/v1/notification/:id
    // @access  : Private
    // @param   : id
    update(req: any, res: Response): void {
        Notifications.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(notification => {
                AppResponse.success(res, notification);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }

    // =========================================================================
    // delete a notification
    // =========================================================================
    // @desc    : Delete notification
    // @route   : DELETE /api/v1/notification/:id
    // @access  : Private
    // @param   : id
    deleteOne(req: Request, res: Response): void {
        Notifications.deleteOne({ _id: req.params.id })
            .then(notification => {
                AppResponse.success(res, notification);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }


    // =========================================================================
    // Get all notifications
    // =========================================================================
    // @desc    : Get all notifications
    // @route   : GET /api/v1/notification
    // @access  : Private
    // @params   : search, perPage, page, sortBy, sortDesc, user, select
    getAll(req: Request, res: Response): void {
        let query;
        Notifications.find(query || {})
            .then(notification => {
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

                const filteredData = notification.filter((item) => {
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
    // Get one notification
    // =========================================================================
    // @desc    : Get one notification
    // @route   : GET /api/v1/notification/:id
    // @access  : Private
    // @param   : id
    getOne(req: any, res: Response): void {
        Notifications.findOne({ _id: req.params.id })
            .then(notification => {
                AppResponse.success(res, notification);
            })
            .catch(err => {
                AppResponse.fail(res, err);
            });
    }
}

const notificationsController = new NotificationController()

export default notificationsController




