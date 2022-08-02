import shopModel, { IShop } from "../../model/collections/Shop.Model";
import Users from "../../model/UsersAuth.Model";
import { apiCrypto } from "../../utils/CrytoUtils";

class ShopServices {
  constructor() {}

  async createNew(data: any) {
    const { brand, body, owner } = data;
    const secretKey = apiCrypto.developeSecretKey();
    const shop: IShop = await shopModel.create({
      "credentials.secretKey": secretKey,
      brand,
      ...body,
      owner,
    });
    return shop;
  }

  async updateById(id: any, data: any) {
    await shopModel.findByIdAndUpdate(id, data, { new: true });
    return true;
  }

  async addCustomer(customerId: any, shopId: any) {
    const shop = await shopModel.findByIdAndUpdate(shopId, {
      $push: { customers: customerId },
    });
    await Users.findByIdAndUpdate(customerId, { $push: { shops: shopId } });
    return shop;
  }

  async addProduct(productId: any, shopId: any) {
    const shop = await shopModel.findByIdAndUpdate(shopId, {
      $push: { products: productId },
    });
    return shop;
  }

  async developeCredentials(shopId: any, secretKey: any) {
    const shopToken = apiCrypto.developShopToken(shopId, secretKey);
    return shopToken;
  }
}

const shopServices = new ShopServices();
export default shopServices;
