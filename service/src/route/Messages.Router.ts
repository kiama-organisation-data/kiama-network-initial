import { Router } from "express";

class MessagesRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {}
}

export default new MessagesRouter().router;
