import CartDTO from "../dao/DTO/cart.dto.js";
import { productsService, ticketsService } from "./index.js";

export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createCart = async () => {
    return await this.dao.create();
  };

  getCart = async (id) => {
    return await this.dao.getByID(id);
  };

  updateCart = async (id, data) => {
    const cart = await this.dao.update(id, data);
    return new CartDTO(cart);
  };

  addProductToCart = async (cart, product) => {
    if (!cart) throw new Error("No se ha encontrado el carrito" ) 
    if (!product) throw new Error("No se ha encontrado el producto")

    const productIndex = cart.products.findIndex((p) => p.product?.equals(product._id));
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await this.updateCart(cart.id, cart)
    } else {
      cart.products[productIndex].quantity++;
      await this.updateCart(cart.id, cart)
    }
    return new CartDTO(cart)
  };

  purchase = async (cid, purchaser, ) => {
    const cart = await this.getCart(cid)
    if(cart.products.length === 0) throw new Error('El carrito está vacío')

    const cartProducts = await Promise.all(cart.products.map(async product => {
      const newObj = await productsService.getProduct(product.product || product._id)
      newObj.quantity = product.quantity
      return newObj
    }))
    
    const outOfStock = cartProducts.filter(p => p.stock < p.quantity).map(p => ({product: p._id, quantity: p.quantity}))
    const available = cartProducts.filter(p => p.stock >= p.quantity)
    const amount = available.reduce((acc, product) => acc + product.price, 0)
    
    const ticket = available.length > 0 ? (await ticketsService.createTicket({ amount, purchaser })).toObject() : null
    available.forEach(async product => await productsService.updateStock(product._id, product.quantity))
    await this.updateCart(cid, {products: outOfStock})

    return { outOfStock, ticket }
  }
}
