import express from "express";
import CartManager from "../managers/cart-manager-db.js";
import CartModel from "../dao/models/cart.model.js";

const router = express.Router();
const cartManager = new CartManager();

// 1) Creamos un nuevo carrito:  ------- POST http://localhost:PUERTO/

router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.crearCarrito();
    res.json(nuevoCarrito);
  } catch (error) {
    console.error("Error al crear un nuevo carito ", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al crear carrito" });
  }
});

//2) Listamos los productos que pertenecen a determinado carrito. ------- GET /cart/cid
router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  try {
    const carrito = await CartModel.findById(cartId);

    if (!carrito) {
      console.log("no existe el carrito con el id, ", cartId);
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Enviamos el carrito como respuesta si existe
    res.json(carrito);
  } catch (error) {
    console.error("Error al objener el carrito", error);
    res.status(500).json({
      error: "error al obtener el carrito",
      message: error.message,
    });
  }
});

// 3) Agregar productos a distintos carritos.     ------- POST /:cid/product/:pid
router.post("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  try {
    const actualizarCarrito = await cartManager.agregarProductoAlCarrito(
      cartId,
      productId,
      quantity
    );
    res.json(actualizarCarrito.products);
  } catch (error) {
    console.error("Error al agregar producto al carrito ", error);
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 4) Eliminamos un producto específico del carrito.  ------- DELETE /:cid/product/:pid

router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const updatedCart = await cartManager.eliminarProductoDelCarrito(
      cartId,
      productId
    );

    res.json({
      status: "success",
      message: "producto eliminado del carrito correctamente",
      updatedCart,
    });
  } catch (error) {
    console.error("Error al eliminar el producto del carrito", error);
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    });
  }
});

// 5) Actualizamos productos del carrito  ------- PUT /:cid
router.put("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const updatedProducts = req.body;

  try {
    const updatedCart = await cartManager.actualizarCarrito(
      cartId,
      updatedProducts
    );
    res.json(updatedCart);
  } catch (error) {
    console.error("Error al actualizar el carrito", error);
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    });
  }
});

// 6) Actualizamos las cantidades de productos      -------- PUT /:cid/product/:pid
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const newQuantity = req.body.quantity;

    const updatedCart = await cartManager.actualizarCantidadDeProducto(
      cartId,
      productId,
      newQuantity
    );

    res.json({
      status: "success",
      message: "Cantidad del producto actualizada correctamente",
      updatedCart,
    });
  } catch (error) {
    console.error(
      "Error al actualizar la cantidad del producto en el carrito",
      error
    );
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    });
  }
});

// 7) Vaciamos el carrito:      ------------- DELETE /:cid
router.delete("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const updatedCart = await cartManager.vaciarCarrito(cartId);

    res.json({
      status: "success",
      message:
        "Todos los productos del carrito fueron eliminados correctamente",
      updatedCart,
    });
  } catch (error) {
    console.error("Error al vaciar el carrito", error);
    res.status(500).json({
      status: "error",
      error: "Error interno del servidor",
    });
  }
});

//8 ver todos los carritos ------ http://localhost:3000/api/carts/
router.get("/", async (req, res) => {
  try {
    const carritos = await CartModel.find(); // Obtiene todos los carritos
    res.json(carritos); // Devuelve los carritos en formato JSON
  } catch (error) {
    console.error("Error al obtener carritos", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
export default router;
