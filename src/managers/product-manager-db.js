import ProductModel from "../dao/models/product.model.js";

class ProductManager {
  // Método para agregar un nuevo producto
  async addProduct({
    title,
    description,
    price,
    image,
    code,
    stock,
    category,
    thumbnails,
  }) {
    try {
      // Verificar que todos los campos requeridos estén presentes
      if (!title || !description || !price || !code || !stock || !category) {
        console.log("Todos los campos son obligatorios");
        throw new Error("Todos los campos son obligatorios");
      }

      // Verificar si el producto con ese código ya existe en la base de datos
      const existeProducto = await ProductModel.findOne({ code: code });

      if (existeProducto) {
        console.log("El código debe ser único."); // mensaje de error si ya existe un producto con ese código
        return;
      }

      // Si no se proporciona una imagen, usar una imagen por defecto
      const defaultImage = "https://via.placeholder.com/300x200?text=No+Image";
      const productImage = image || defaultImage;

      const newProduct = new ProductModel({
        title,
        description,
        price,
        img: productImage,
        code,
        stock,
        category,
        status: true,
        thumbnails: thumbnails || [],
      });

      // Guardar el nuevo producto en la base de datos
      await newProduct.save();
    } catch (error) {
      // Capturar y mostrar cualquier error durante el proceso
      console.log("Error al agregar producto", error);
      throw error;
    }
  }

  //  Método para obtener productos con paginación, ordenamiento y filtro por categoría
  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    //{limit = 10, page = 1, sort, query} se utiliza para establecer valores por defecto y opcionales en el parámetro que se pasa a la función
    //getProducts() = busqued por defecto; Esto buscaría los primeros 10 productos de la primera página, sin orden específico ni filtro de categoría.
    //getProducts({ limit: 20, page: 2, sort: 'asc', query: 'electronics' });Esto buscaría los productos de la categoría 'electronics', mostrando un máximo de 20 productos por página, en orden ascendente de precio, en la segunda página de resultados.

    try {
      // Calcular el número de documentos a omitir para la paginación
      const skip = (page - 1) * limit;

      // Crear un objeto para almacenar las condiciones de la consulta
      let queryOptions = {};

      // Si se proporciona un filtro por categoría, se agrega a la consulta
      if (query) {
        queryOptions = { category: query };
      }

      // Configuración del ordenamiento por precio (ascendente o descendente)
      const sortOptions = {};
      if (sort) {
        if (sort === "asc" || sort === "desc") {
          sortOptions.price = sort === "asc" ? 1 : -1; // 1 para ascendente, -1 para descendente
        }
      }

      // Buscar productos con las opciones de consulta, ordenamiento, paginación
      const productos = await ProductModel.find(queryOptions) // Filtrar por categoría si se proporcionó
        .sort(sortOptions) // Ordenar por precio si se especificó
        .skip(skip) // Paginación: omitir los primeros productos según la página solicitada
        .limit(limit); // Limitar la cantidad de productos a mostrar por página

      // Contar el número total de productos que coinciden con la consulta
      const totalProducts = await ProductModel.countDocuments(queryOptions);

      // Calcular el número total de páginas basadas en el total de productos y el límite por página
      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1; // Verificar si hay una página anterior
      const hasNextPage = page < totalPages; // Verificar si hay una página siguiente

      // Devolver los productos encontrados junto con la información de paginación
      return {
        docs: productos,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/api/products?limit=${limit}&page=${
              page - 1
            }&sort=${sort}&query=${query}`
          : null,
        nextLink: hasNextPage
          ? `/api/products?limit=${limit}&page=${
              page + 1
            }&sort=${sort}&query=${query}`
          : null,
      };
    } catch (error) {
      console.log("Error al obtener los productos", error); // Capturar y mostrar cualquier error durante el proceso
      throw error;
    }
  }

  // Método para obtener un producto por su ID
  async getProductById(id) {
    try {
      // Buscar el producto por su ID en la base de datos
      const producto = await ProductModel.findById(id);

      if (!producto) {
        console.log("Producto no encontrado"); // Si no se encuentra el producto, se muestra un mensaje
        return null;
      }

      console.log("Producto encontrado"); // Mensaje si el producto fue encontrado
      return producto;
    } catch (error) {
      console.log("Error al traer un producto por id"); // Capturar y mostrar cualquier error durante el proceso
    }
  }

  // Método para actualizar los datos de un producto
  async updateProduct(id, productoActualizado) {
    try {
      // Buscar y actualizar el producto por su ID
      const updateado = await ProductModel.findByIdAndUpdate(
        id,
        productoActualizado
      );

      if (!updateado) {
        console.log("No se encuentra che el producto"); // Si no se encuentra el producto, mostrar mensaje
        return null;
      }

      console.log("Producto actualizado con exito"); // Mensaje de éxito si el producto fue actualizado
      return updateado; // Devolver el producto actualizado
    } catch (error) {
      console.log("Error al actualizar el producto", error); // Capturar y mostrar cualquier error durante el proceso
    }
  }

  // Método para eliminar un producto
  async deleteProduct(id) {
    try {
      // Buscar y eliminar el producto por su ID
      const deleteado = await ProductModel.findByIdAndDelete(id);

      if (!deleteado) {
        console.log("No se encuentraaaa, busca bien!"); // Si no se encuentra el producto, mostrar mensaje
        return null;
      }

      console.log("Producto eliminado correctamente!"); // Mensaje de éxito si el producto fue eliminado
    } catch (error) {
      console.log("Error al eliminar el producto", error); // Capturar y mostrar cualquier error durante el proceso
      throw error;
    }
  }
}

export default ProductManager;
