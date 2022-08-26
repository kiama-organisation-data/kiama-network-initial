class MidFuncs {
	constructor() {}

	/**
	 * @method WalletFunctions checks number of users with a wallet and creates a serial key
	 */
	public WalletFunctions(count: number): string {
		let serialKey: string = "";
		if (count === 0) {
			serialKey = "kw-00x-000001";
		} else if (count < 10) {
			serialKey = "kw-000x-00000" + (count + 1);
		} else if (count > 10 && count < 100) {
			serialKey = "kw-00x-0000" + (count + 1);
		} else if (count > 1000 && count < 10000) {
			serialKey = "kw-00x-000" + (count + 1);
		} else if (count > 10000) {
			serialKey = "kw-00x-00" + (count + 1);
		}
		return serialKey;
	}
}

export default new MidFuncs();
