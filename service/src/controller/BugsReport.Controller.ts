import { Request, Response } from "express";
import Bugs, { IBug } from "../model/BugsReport.Model";
import AppResponse from "../services/index";
import sortData from "../middleware/utils";

class BugController {
  constructor() {}
  // =========================================================================
  // Add a new bug
  // =========================================================================
  // @desc    : Add a new bug
  // @route   : POST /api/v1/bug
  // @access  : Private
  create(req: Request, res: Response): void {
    Bugs.create(req.body)
      .then((bug) => {
        AppResponse.created(res, bug);
      })
      .catch((err) => {
        AppResponse.fail(res, err);
      });
  }

  // =========================================================================
  // update a bug
  // =========================================================================
  // @desc    : Update a bug
  // @route   : PUT /api/v1/bug/:id
  // @access  : Private
  // @param   : id
  update(req: any, res: Response): void {
    Bugs.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      upsert: true,
    })
      .then((bug) => {
        AppResponse.success(res, bug);
      })
      .catch((err) => {
        AppResponse.fail(res, err);
      });
  }

  // =========================================================================
  // delete a bug
  // =========================================================================
  // @desc    : Delete bug
  // @route   : DELETE /api/v1/bug/:id
  // @access  : Private
  // @param   : id
  deleteOne(req: Request, res: Response): void {
    Bugs.deleteOne({ _id: req.params.id })
      .then((bug) => {
        AppResponse.success(res, bug);
      })
      .catch((err) => {
        AppResponse.fail(res, err);
      });
  }

  // =========================================================================
  // Get all bugs
  // =========================================================================
  // @desc    : Get all bugs
  // @route   : GET /api/v1/bug
  // @access  : Private
  // @params   : search, perPage, page, sortBy, sortDesc, status, select
  getAll(req: Request, res: Response): void {
    let query;
    Bugs.find(query || {})
      .then((bug) => {
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

        const filteredData = bug.filter((item) => {
          return (
            // search
            item.title.toLowerCase().includes(queryLowered) &&
            // Filter
            item.status.toString() ===
              (status.toString() || item.status.toString())
          );
        });

        const sortedData = filteredData.sort(sortData.sortCompare(sortBy));
        if (sortDesc === "true") {
          sortedData.reverse();
        }

        // result to show
        const dataFinal = sortData.selectFields(sortedData, select);
        AppResponse.success(
          res,
          sortData.paginateArray(dataFinal, perPage, page),
          filteredData.length
        );
      })
      .catch((err) => {
        AppResponse.fail(res, err);
      });
  }

  // =========================================================================
  // Get one bug
  // =========================================================================
  // @desc    : Get one bug
  // @route   : GET /api/v1/bug/:id
  // @access  : Private
  // @param   : id
  getOne(req: any, res: Response): void {
    Bugs.findOne({ _id: req.params.id })
      .then((bug) => {
        AppResponse.success(res, bug);
      })
      .catch((err) => {
        AppResponse.fail(res, err);
      });
  }
}

const bugsController = new BugController();

export default bugsController;
