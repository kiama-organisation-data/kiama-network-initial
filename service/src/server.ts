import mongoose from 'mongoose'
import express, { Application, Request, Response } from 'express'
import * as bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import * as path from 'path'
import cors from 'cors'


import UsersRouter from './route/UsersAuth.Router'



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
		this.app.use(express.static(path.join(__dirname, 'public')))
		this.app.use(express.static(path.join(__dirname, 'uploads')))
	}

	public routes() {
		// DESCRIPTION: route part one
		this.app.use("/kiama-network/api/user", UsersRouter)


		// DESCRIPTION: route for upload file
		this.app.use("/uploads", express.static('uploads'))
	}

}

export default new Server()