import express from "express";
import {
  checkAuth,
  redirectIfLoggedIn,
  requireAuth,
} from "../middlewares/auth.middleware.js";
import ProductManager from "../managers/product-manager-db.js";
import CartManager from "../managers/cart-manager-db.js";

const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

//Ruta principal - redirige a productos
router.get("/", (req, res) => {
  res.redirect("/products");
});

//Rutas de autenticación
router.get("/register", redirectIfLoggedIn, (req, res) => {
  res.render("register");
});

router.get("/login", redirectIfLoggedIn, (req, res) => {
  const message = req.query.message;
  res.render("login", { message });
});

router.get("/profile", requireAuth, (req, res) => {
  res.render("profile");
});

router.get("/products", checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const productos = await productManager.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const nuevoArray = productos.docs.map((producto) => {
      const { _id, ...rest } = producto.toObject();
      return rest;
    });

    res.render("products", {
      productos: nuevoArray,
      hasPrevPage: productos.hasPrevPage,
      hasNextPage: productos.hasNextPage,
      prevPage: productos.prevPage,
      nextPage: productos.nextPage,
      currentPage: productos.page,
      totalPages: productos.totalPages,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).render("error", { error: "Error al cargar los productos" });
  }
});

router.get("/carts/:cid", checkAuth, async (req, res) => {
  const cartId = req.params.cid;

  try {
    const carrito = await cartManager.getCarritoById(cartId);

    if (!carrito) {
      console.log("No existe ese carrito con el id");
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productosEnCarrito = carrito.products.map((item) => ({
      product: item.product.toObject(),
      //Lo convertimos a objeto para pasar las restricciones de Exp Handlebars.
      quantity: item.quantity,
    }));

    res.render("carts", { productos: productosEnCarrito });
  } catch (error) {
    console.error("Error al obtener el carrito", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
