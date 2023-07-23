const sequelize = require("../dbConnexion");
const { Meal, Schedule, User } = require('../models/associations');
const newUserData = require('../middlewares/userData');
const apiError = require('../errors/apiErrors');

const scheduleController = {
  addMealSchedule: async (req, res) => {
    const t = await sequelize.transaction();
    const user_id = req.user.id;
    // try {
    const { meals, week } = req.body;
    const user = await User.findByPk(user_id, {
      include: ['favorites', { model: Schedule, as: 'schedules', include: 'meals' }]
    });

    // ----- Search Schedule with Id User et Week number
    const schedule = await Schedule.findOne({ where: { user_id, week: week } });

    if (!user) {
      // return res.status(400).json(`this user don't exist.`);
      throw new apiError(`this user don't exist`, { statusCode: 400 });
    }

    /*
    // ---- if schedule not exist, we create it with meal
    if (!schedule) {
        const addSchedule = await Schedule.create({
            user_id: user_id,
            week: week,
        }, { transaction: t });

        const addMeal = await Meal.create({
            idDbMeal: meals.idDbMeal,
            schedule_id: addSchedule.id,
            name: meals.name,
            image: meals.imageUrl,
            position: meals.position,
        }, { transaction: t })

        user.schedules.push(addMeal)

    } else {
        // ----- Check if position already exist on the meal
        const mealFind = await Meal.findOne({ where: { schedule_id: schedule.id, position: meals.position } });

        if (mealFind) {
            return res.status(400).json(`This meal already exist.`);
        } else {

    */

    if (!schedule) {
      // return res.status(400).json(`schedule don't exist.`);
      throw new apiError(`schedule don't exist`, { statusCode: 400 });
    }

    // ----- Check if position already exist on the meal
    const mealFind = await Meal.findOne({ where: { schedule_id: schedule.id, position: meals.position } });
    if (mealFind) {
      mealFind.idDbMeal = meals.idDbMeal;
      mealFind.name = meals.name;
      mealFind.image = meals.image;
      mealFind.position = meals.position;

      mealFind.save()
    } else {
      await Meal.create({
        idDbMeal: meals.idDbMeal,
        schedule_id: schedule.id,
        name: meals.name,
        image: meals.image,
        position: meals.position,
      })
    }
    await t.commit();
    const newUser = await newUserData(user_id);
    return res.status(200).json({status:"ok",user:newUser});
    // throw new apiError({ status: "ok", user: newUser }, { statusCode: 200 });
    // } catch (error) {
    //   console.log(error);
    //   await t.rollback();
    //   // res.status(500).json(error.toString())
    //   throw new apiError(error.toString(), { statusCode: 500 });
    // }
  },

  deleteSchedule: async (req, res) => {
    // try {
    const user_id = req.user.id;
    const meal_id = req.params.id;
    console.log(meal_id)
    const meal = await Meal.findByPk(meal_id);

    if (!meal) {
      // res.status(404).json('Can not find meal with id ' + meal_id);
      throw new apiError('Can not find meal with id ' + meal_id, { statusCode: 404 });
    } else {
      await Meal.destroy({ where: { id: meal_id } })
      const newUser = await newUserData(user_id);
      return res.status(200).json({status:"ok",user:newUser});
      // throw new apiError({ status: "ok", user: newUser }, { statusCode: 200 });
    }
    // } catch (error) {
    //   console.log(error);
    //   // res.status(500).json(error.toString())
    //   throw new apiError(error.toString(), { statusCode: 500 });
    // }
  },
};

module.exports = scheduleController;
