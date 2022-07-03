import { Request, Response } from 'express'
import Users, { IUser } from '../model/UsersAuth.Model'
import mongoose from 'mongoose'

import sortData from '../middleware/utils'


class UserController {

    // initialisation constructor
    constructor() { }

    // =========================================================================
    // Get all users
    // =========================================================================
    GetAllUsers = (req: Request, res: Response) => {
        let query;
        Users.find(query || {}).select('-password -createdAt -updatedAt')
            .then(user => {
                const {
                    q = '',
                    perPage = 10,
                    page = 1,
                    sortBy = 'createdAt',
                    sortDesc = false,
                    role = '',
                    status = '',
                    select = 'all',
                } = req.query

                const queryLowered = q.toLowerCase()

                const filteredData = user.filter(item => {
                    return (
                        // search
                        item.name.toLowerCase().includes(queryLowered) || item.username.toLowerCase().includes(queryLowered) || item.email.toLowerCase().includes(queryLowered) || item.role.toLowerCase().includes(queryLowered) || item.status.toLowerCase().includes(queryLowered)
                    ) && item.role.toString() === (role.toString() || item.role.toString()) && item.status.toString() === (status.toString() || item.status.toString())
                })

                const sortedData = filteredData.sort(sortData.sortCompare(sortBy))
                if (sortDesc === 'true') {
                    sortedData.reverse()
                }

                // 
                const dataFinal = sortData.selectFields(sortedData, select)

                res.status(200).json({
                    success: true,
                    users: sortData.paginateArray(dataFinal, perPage, page),
                    total: filteredData.length,
                    message: 'List of all users',
                })

            })
            .catch(err => {
                res.status(500).end();
            });
    }

    // =========================================================================
    // Get user by id
    // =========================================================================
    GetUser(req: any, res: Response): void {
        Users.findOne({ _id: req.params.id })
            .then(user => {
                res.status(200).json({
                    success: true,
                    message: 'One user found',
                    body: user
                })
            })
            .catch(err => {
                res.status(404).json({ success: false, message: err });
            });
    }

    // =========================================================================
    // delete user by id
    // =========================================================================
    InactiveUser(req: any, res: Response): void {
        Users.findOneAndUpdate({ _id: req.params.id }, { status: 'inactive' })
            .then(user => {
                res.json({ success: true, message: `user ${req.params.id} deleted !` })
            })
            .catch(err => {
                res.json({ success: false, message: err });
            });
    }

    // =========================================================================
    // update user by id
    // =========================================================================
    UpdateUser(req: any, res: Response): void {
        Users.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(user => {
                res.json({ success: true, messsage: `User ${req.params.id} updated !`, body: user })
            })
            .catch(err => {
                res.json({ success: false, message: err })
            });
    }
}

const userController = new UserController()

export default userController