const router = require("express").Router();
const { BasicaModel, validateBasica } = require("../Models/basicaModel"); // Importa el modelo Basica

/**
 * metodo get para obtener la informacion de la basica
 * @returns {object} 200 - Array de objetos de la colección basica
 */
router.get("/", async (req, res) => {
  try {
    // Busca todos los documentos en la colección "basica"
    const basicaEntries = await BasicaModel.find();
    // Devuelve los documentos como JSON
    res.json(basicaEntries);
  } catch (error) {
    console.error("Error al consultar la colección basica en MongoDB:", error);
    res
      .status(500)
      .json({ error: "Error al consultar la colección basica en MongoDB" });
  }
});

/**
 * metodo post para guardar la informacion de la basica
 * @returns message info - Mensaje de información sobre que paso al guardar
 */
router.post("/", async (req, res) => {
  try {
    const { error } = validateBasica(req.body); // Validar usando Joi o Mongoose
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });

    const newBasicaEntry = new BasicaModel(req.body);
    await newBasicaEntry.save();
    res.status(201).json({ message: "Se creo basica from correctamente" });
  } catch (error) {
    console.error(
      "Error al guardar la entrada en la colección basica en MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error al guardar la entrada en la colección basica en MongoDB",
    });
  }
});

/**
 * metodo put para actualizar la informacion de la basica
 * @returns message info - Mensaje de información sobre que paso al actualizar
 */
router.put("/:id", async (req, res) => {
  try {
    const { error } = validateBasica(req.body); // Validar usando Joi o Mongoose
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });
    }

    // Buscar y actualizar la entrada con el id proporcionado
    const updatedBasicaEntry = await BasicaModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // `new: true` devuelve el documento actualizado
    );

    // Verificar si se encontró el documento
    if (!updatedBasicaEntry) {
      return res.status(404).json({ message: "Entrada no encontrada" });
    }

    res.status(200).json({
      message: "Entrada actualizada correctamente",
      data: updatedBasicaEntry,
    });
  } catch (error) {
    console.error(
      "Error al actualizar la entrada en la colección basica en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al actualizar la entrada en la colección basica en MongoDB",
    });
  }
});

/**
 * metodo delete para eliminar la informacion de la basica por id
 * @returns message info - Mensaje de información sobre que paso al eliminar
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL

    const result = await BasicaModel.findByIdAndDelete(id); // Eliminar el documento por ID

    if (!result) {
      return res.status(404).json({ message: "Documento no encontrado" });
    }

    res.status(200).json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error(
      "Error al eliminar el documento de la colección basica en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al eliminar el documento de la colección basica en MongoDB",
    });
  }
});

module.exports = router;
