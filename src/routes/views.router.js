import { Router } from "express";
import passport from "passport";
import {
  redirect,
  getProducts,
  renderForm,
  deleteProduct,
  getProduct,
  addProduct,
  filterByCategory,
  getCartProducts,
  addToCart,
  renderRegister,
  renderLogin,
  register,
  login,
  logout,
  getUser,
  githubLogin,
} from "../controllers/views.controller.js";

import { viewsPassportCall, viewsAuthorization } from "../middleware/auth.js";

const router = Router();

router.get("/", redirect);
router.get("/products", viewsPassportCall("current"), getProducts);
router.get("/products/:pid", viewsPassportCall("current"), getProduct);
router.get("/products/create", viewsPassportCall("current"), viewsAuthorization("admin"), renderForm);
router.get("/products/delete/:pid", viewsPassportCall("current"), viewsAuthorization("admin"), deleteProduct);
router.post("/products", viewsPassportCall("current"), viewsAuthorization("admin"), addProduct);
router.post("/products/category", viewsPassportCall("current"), filterByCategory);
router.get("/carts/:cid", viewsPassportCall("current"), viewsAuthorization("user"), getCartProducts);
router.post("/carts/:cid/products/:pid", viewsPassportCall("current"), viewsAuthorization("user"), addToCart);
router.get("/sessions/register", renderRegister);
router.get("/sessions/login", renderLogin);
router.post("/sessions/register", viewsPassportCall("register"), register);
router.post("/sessions/login", viewsPassportCall("login"), login);
router.get("/sessions/logout", viewsPassportCall("current"), logout);
router.get("/sessions/user", viewsPassportCall("current"), getUser);
router.get("/api/sessions/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), githubLogin);

export default router;
