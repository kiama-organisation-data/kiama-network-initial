import unique from "../../libs/randomGen";
import OrderModel from "../../model/collections/Order.Model";
import stripePayment from "./Payment.Services";

class ProductService {
	constructor() {}

	// this method creates a new order in the Order collection
	async createOrder(user: object, products: any) {
		const order = await OrderModel.create({
			user,
			products,
		});
		return order;
	}

	/** 
   * 
   * this method passes a body object containing a bank card details 
   to the stripePayment service
   @return token will return a stripe card token id
   */
	async createUserToken(body: any) {
		const token = await stripePayment.genCardToken(body);
		return token;
	}

	/**
	 *
	 * @param body contains an orderId and token: denoting token id
	 * returned from the createUserToken method
	 * @returns will send an updated Order object after
	 * validating the card and other logic
	 */
	async chargeCard(body: any) {
		const { orderId, token } = body;

		const order = await OrderModel.findById(orderId);

		if (!order) throw new Error("cannot find an order");

		let price = 0;

		order.products.map((prod) => {
			//@ts-ignore
			price += prod.quantity * prod.product.price;
		});

		const orderObj = { description: "Purchase of goods", price };

		const { id } = await stripePayment.chargeCard({ orderObj, token });

		const { amount, payment_method_details } =
			await stripePayment.validateCharge(id);

		// unique is similar to the uuid model that generates random strings
		const paymentId = unique();

		const updatedOrderObj = {
			valid: true,
			paymentId,
			"payment.status": "PAID",
			"payment.totalCost": amount,
			"payment.paymnetMethod": payment_method_details?.card?.brand,
			"paymnet.date": new Date().toLocaleDateString(),
		};

		await OrderModel.findByIdAndUpdate(orderId, updatedOrderObj, { new: true });

		return order;
	}
}

export default new ProductService();
