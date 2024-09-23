const router = require("express").Router();
const mongoose = require("mongoose");

const {
  StrategicPlan,
  validateStrategicPlan
} = require("../Models/StrategicPlanModel"); // Importa el modelo StrategicPlanModel
const { User, validateUser } = require("../Models/UserModel"); // Ajusta la ruta según la ubicación de tu archivo de modelo

const SWOT = require("../Models/swot");
const CAME = require("../Models/came");


/**
 * función que obtiene todos los planes estratégicos
 * @returns {Object} - Lista de planes estratégicos
 * @throws {Object} - Mensaje de error
 */
router.get("/AllStrategicPlans", async (req, res) => {
  try {
    const strategicPlans = await StrategicPlan.find();
    res.json(strategicPlans);
  } catch (error) {
    console.error(
      "Error al consultar la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      error: "Error al consultar la colección StrategicPlanModel en MongoDB",
    });
  }
});

/**
 * función que obtiene un plan estratégico por su ID
 * @param {String} id - ID del plan estratégico
 * @returns {Object} - Plan estratégico
 * @throws {Object} - Mensaje de error
 */
router.get("/ById/:id", async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    const strategicPlan = await StrategicPlan.findById(id).populate(
      "members_ListIDS"
    );
    if (!strategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }
    res.json(strategicPlan);
  } catch (error) {
    console.error(
      "Error al consultar la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message: "Error al consultar la colección StrategicPlanModel en MongoDB",
    });
  }
});

/**
 * función que obtiene los planes estratégicos de un usuario por medio del ID del usuario
 * @param {String} userId - ID del usuario a consultar sus planes estratégicos
 * @returns {Object} - Lista de planes estratégicos del usuario
 * @throws {Object} - Mensaje de error
 */
router.get("/ByUserID/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user.strategicPlans_ListIDS);
  } catch (error) {
    console.error("Error al consultar los planes del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al consultar los planes del usuario" });
  }
});

/**
 * función que obtiene los planes estratégicos activos de un usuario
 * @param {String} userId - ID del usuario a consultar sus planes activos
 * @returns {Object} - Lista de planes estratégicos activos del usuario
 * @throws {Object} - Mensaje de error
 */
router.get("/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();

    // Encuentra al usuario y obtén los IDs de sus planes estratégicos
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Filtra los planes activos basados en la fecha actual
    const activePlans = await StrategicPlan.find({
      _id: { $in: user.strategicPlans_ListIDS },
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    res.json(activePlans);
  } catch (error) {
    console.error("Error al consultar los planes activos del usuario:", error);
    res.status(500).json({
      message: "Error al consultar los planes activos del usuario",
    });
  }
});

/**
 * función que obtiene los planes estratégicos finalizados de un usuario
 * @param {String} userId - ID del usuario a consultar sus planes finalizados
 * @returns {Object} - Lista de planes estratégicos finalizados del usuario
 * @throws {Object} - Mensaje de error
 */
router.get("/finished/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();

    // Encuentra al usuario y obtén los IDs de sus planes estratégicos
    const user = await User.findById(userId).populate("strategicPlans_ListIDS");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Filtra los planes finalizados basados en la fecha actual
    const finishedPlans = await StrategicPlan.find({
      _id: { $in: user.strategicPlans_ListIDS },
      endDate: { $lt: currentDate },
    });

    res.json(finishedPlans);
  } catch (error) {
    console.error(
      "Error al consultar los planes finalizados del usuario:",
      error
    );
    res.status(500).json({
      message: "Error al consultar los planes finalizados del usuario",
    });
  }
});

/**
 * función que sacar un usuario de un plan estratégico lo saca de la lista de miembros del plan, elimina las invitaciones a ese plan
 * y elimina el plan de la lista de planes del usuario
 * @param {String} userId - ID del usuario a eliminar del plan
 * @param {String} planId - ID del plan estratégico
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 */
router.post("/out", async (req, res) => {
  try {
    const { userId, planId } = req.body; // Obtener el ID del usuario y del plan

    // Verificar si el plan existe antes de eliminar
    const plan = await StrategicPlan.findById(planId);
    if (!plan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }

    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el plan de la lista de planes del usuario
    await User.findByIdAndUpdate(userId, {
      $pull: { strategicPlans_ListIDS: planId },
    });

    // Eliminar el usuario de la lista de miembros del plan
    await StrategicPlan.findByIdAndUpdate(planId, {
      $pull: { members_ListIDS: { userId: userId } },
    });

    // Eliminar las invitaciones del usuario para el plan
    await User.updateOne(
      { _id: userId },
      { $pull: { invitations: { planId: planId } } }
    );

    // Confirmar la eliminación
    res
      .status(200)
      .json({ message: "Usuario eliminado del plan exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario del plan:", error);
    res.status(500).json({ message: "Error al eliminar el usuario del plan" });
  }
});

/**
 * Función que crea un nuevo plan estratégico y lo asocia a un usuario.
 * @param {Object} req.body - Plan estratégico a crear.
 * @param {Object} req.params.userId - ID del usuario al que se asociará el plan.
 * @returns {Object} - Mensaje de confirmación.
 * @throws {Object} - Mensaje de error.
 */
router.post("/create/:userId", async (req, res) => {
  try {
    console.log("req.body", req.body);
    // Validar los datos de entrada
    const { error } = validateStrategicPlan(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });
    }

    // Verificar si el usuario existe
    const { userId } = req.params;
    console.log("userId", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Crear un nuevo plan estratégico con FODA y MECA vacios
    const newStrategicPlan = new StrategicPlan(req.body);
    await newStrategicPlan.save()
      .then(plan => {
          const newSWOT = new SWOT({
              StrategicPlanID: plan._id,//Se enlaza el plan Estrategico a su analisis FODA
              strengths:[],
              weaknesses:[],
              opportunities:[],
              threats:[]
          });
          const newCAME = new CAME({
                StrategicPlanID: plan._id,//Se enlaza el plan Estrategico a su analisis MECA
                correct: [],
                afront: [],
                maintain: [],
                explore: []
              }
            );
          
          newCAME.save()
              .then(came => {
              // Actualizar el StrategicPlan con el ID de CAME
                plan.CAME = came._id;
                })

          newSWOT.save()
              .then(swot => {
              // Actualizar el StrategicPlan con el ID de CAME
                plan.SWOT = swot._id;
                })
          });

    // Asociar el plan al usuario
    await User.updateOne(
      { _id: userId },
      { $push: { strategicPlans_ListIDS: newStrategicPlan._id } }
    );

    // Asociar el usuario al plan
    await StrategicPlan.updateOne(
      { _id: newStrategicPlan._id },
      { $push: { members_ListIDS: new mongoose.Types.ObjectId(userId) } }
    );

    // Responder con un mensaje de éxito
    res.status(201).json({
      message: `Se creó correctamente el plan estratégico y se asoció al usuario ${user.name}.`,
    });
  } catch (error) {
    console.error(
      "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al guardar la entrada en la colección StrategicPlanModel en MongoDB.",
    });
  }
});

/**
 * función que actualiza Foda y Meca de un plan estratégico por su ID
 * @param {String} id - ID del plan estratégico
 * @param req.body datos a actualizar del Foda Meca del plan estratégico
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 
router.put("/FodaMeca/:id", async (req, res) => {
  // Mapeo de los datos recibidos en el cuerpo de la solicitud
  const {
    strengths,
    opportunities,
    weaknesses,
    threats,
    maintain,
    adapt,
    correct,
    explore,
  } = req.body;

  const fodaData = {
    strengths: strengths || [],
    opportunities: opportunities || [],
    weaknesses: weaknesses || [],
    threats: threats || [],
  };

  const mecaData = {
    maintain: maintain || [],
    adapt: adapt || [],
    correct: correct || [],
    explore: explore || [],
  };

  // Crear el objeto que será validado y enviado a la base de datos
  const updatedData = {
    FODA: fodaData,
    MECA: mecaData,
  };

  // Validar los datos mapeados
  // const { error } = validateStrategicPlan(updatedData);
  // if (error) return res.status(400).send(error.details[0].message);

  try {
    // Buscar el documento por ID y actualizarlo
    const updatedPlan = await StrategicPlan.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    // Si el documento no existe, enviar un error
    if (!updatedPlan)
      return res
        .status(404)
        .json({ message: "Plan estratégico no encontrado" });

    res.json({
      message: "Plan estratégico actualizado correctamente",
      data: updatedPlan,
    });
  } catch (err) {
    // Manejo de errores en caso de una excepción
    res
      .status(500)
      .sjon({ message: "Error al actualizar el plan estratégico" });
  }
});*/

/**
 * función que actualiza un plan estratégico por su ID
 * @param {String} id - ID del plan estratégico
 * @param req.body) datos a actualizar del plan estratégico
 * @returns {Object} - Mensaje de confirmación
 * @throws {Object} - Mensaje de error
 * */
router.put("/update/:id", async (req, res) => {
  try {
    const { error } = validateStrategicPlan(req.body);
    if (error)
      return res
        .status(400)
        .json({ message: error.details[0].message || "Datos inválidos" });

    const updatedStrategicPlan = await StrategicPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStrategicPlan) {
      return res
        .status(404)
        .json({ message: "StrategicPlanModel no encontrado" });
    }

    res.json({
      message: "StrategicPlanModel actualizado correctamente",
      data: updatedStrategicPlan,
    });
  } catch (error) {
    console.error(
      "Error al actualizar la entrada en la colección StrategicPlanModel en MongoDB:",
      error
    );
    res.status(500).json({
      message:
        "Error al actualizar la entrada en la colección StrategicPlanModel en MongoDB",
    });
  }
});

module.exports = router;
