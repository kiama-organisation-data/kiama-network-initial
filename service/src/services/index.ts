import { Request, Response, NextFunction } from "express";

class AppResponse {
	constructor() {}

	success = (res: Response, data: any, count?: any) => {
		res.status(200).json({ success: "true", json: data, count: count });
	};

	created = (res: Response, data: any) => {
		res.status(201).json({ success: "true", data });
	};

	fail = (res: Response, msg: any) => {
		res.status(400).json({ success: "fail", msg });
	};

	notFound = (res: Response, msg: string = "resource not found") => {
		res.status(404).json({ success: "fail", msg });
	};

	notPermitted = (res: Response, msg: any) => {
		res.status(403).json({ message: "not permitted" });
	};

	updated = (res: Response, msg: string = "updated") => {
		res.status(200).json({ success: "true", msg });
	};

	noFile = (res: Response) => {
		res.status(400).send("No or invalid file present in request ");
	};

	throwError = (res: Response) => {
		res.status(400).send("An unknown error occured");
	};
}

export default new AppResponse();
