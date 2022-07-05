import mongoose from 'mongoose'
import express, { Application, Request, Response } from 'express'
import * as bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import * as path from 'path'
import cors from 'cors'
import helmet from "helmet";
import compression from "compression"

// Import all routes
import UsersRouter from './route/UsersAuth.Router'
import RoleRouter from './route/Role.Router'


class Server {
	public app: Application

	constructor() {
		this.app = express()
		this.config()
	}

	public config(): void {

		// load env
		dotenv.config({ path: path.resolve(process.cwd(), '.env') })

		// Mongodb variable for connection
		const url: any = process.env.MONGODB_URI
		const option = {
			// promiseLibrary: Promise,
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// useCreateIndex: true
		}
		// set up mongoose            
		console.log('Connecting to DB....')
		mongoose.connect(url, option)
			.then(() => console.log('Dabatase connected.'))
			.catch((err) => console.log('Error connection db.', err))

		// mongoose.set('useFindAndModify', false);

		// config
		this.app.use(bodyParser.json({ limit: '25mb' }));
		this.app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

		this.app.use(cors({
			origin: "*",
			optionsSuccessStatus: 200
		}))
		// call helmet for protection
		this.app.use(helmet());

		// call compression to compress all responses of middleware
		this.app.use(compression())

		// TODO: Add morgan


		this.app.use(express.static(path.join(__dirname, 'public')))
		this.app.use(express.static(path.join(__dirname, 'uploads')))
	}

	public routes() {
		// Import all routes
		this.app.use("/kiama-network/api/v1/users", UsersRouter)
		this.app.use("/kiama-network/api/v1/roles", RoleRouter)


		// Route for upload file
		this.app.use("/uploads", express.static('uploads'))
	}

}

export default new Server()