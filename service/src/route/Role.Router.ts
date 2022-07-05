import { Router } from 'express';
import RoleController from '../controller/Role.Controller';


class RoleRouter {

    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {

        this.router.post('/', RoleController.AddRole) // add new role
        this.router.get('/', RoleController.GetAllRoles) // get all roles
        this.router.get('/:id', RoleController.GetRole) // get one role
        this.router.delete('/:id', RoleController.DeleteRole) // Delete role
        this.router.put('/:id', RoleController.UpdateRole) // Update role

    }
}

export default new RoleRouter().router;