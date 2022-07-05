import { Request, Response } from 'express'
import Roles from '../model/Role.Model'
import mongoose from 'mongoose'

class RoleController {

    // initialisation constructor
    constructor() { }

    // @desc    : Get all roles
    // @route   : GET /api/v1/roles
    // @access  : Private
    GetAllRoles(req: Request, res: Response): void {
        Roles.find()
            .then(role => {
                res.json({ success: true, body: role, count: role.length })
            })
            .catch(err => {
                res.json({ success: false, message: err });
            });
    }

    // @desc    : Get one role
    // @route   : GET /api/v1/roles/:id
    // @access  : Private
    GetRole(req: any, res: Response): void {
        Roles.findOne({ _id: req.params.id })
            .then(role => {
                res.json({ success: true, body: role, message: "One role found!" })
            })
            .catch(err => {
                res.json({ success: false, message: err });
            });
    }


    // @desc    : Add new role
    // @route   : POST /api/v1/roles
    // @access  : Private
    AddRole(req: Request, res: Response): void {
        Roles.create(req.body)
            .then(role => {
                res.json({ success: true, body: role, message: "one Role added" })
            })
            .catch(err => {
                res.json({ success: false, message: err });
            });
    }

    // @desc    : Delete role
    // @route   : DELETE /api/v1/roles/:id
    // @access  : Private
    DeleteRole(req: Request, res: Response): void {
        Roles.deleteOne({ _id: req.params.id })
            .then(role => {
                res.json({ success: true, message: `role ${req.params.id} deleted !` })
            })
            .catch(err => {
                res.json({ success: false, message: err });
            });
    }

    // @desc    : Update role
    // @route   : PUT /api/v1/roles/:id
    // @access  : Private
    UpdateRole(req: any, res: Response): void {
        Roles.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true })
            .then(role => {
                res.json({ success: true, messsage: `Role ${req.params.id} updated !`, body: role })
            })
            .catch(err => {
                res.json({ success: false, message: err })
            });
    }

}

const roleController = new RoleController()

export default roleController




