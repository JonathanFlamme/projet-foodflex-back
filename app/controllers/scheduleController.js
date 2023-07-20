const sequelize = require("../dbConnexion");
const { Meal, Schedule, User } = require('../models/associations');
const newUserData = require('../middlewares/userData');

const scheduleController = {
    addWeekSchedule: async (req, res) => {
        const user_id = req.user.id;
        try {
            const { week } = req.body;
            console.log(req.body)
            const user = await User.findByPk(user_id, {
                include: ['favorites', { model: Schedule, as: 'schedules', include: 'meals' }]
            });
            // ----- Search Schedule with Id User et Week number
            const schedule = await Schedule.findOne({ where: { user_id, week: week } });

            if (!user) {
                return res.status(400).json(`this user don't exist.`);
            }

            // ---- if schedule not exist, we create it with meal
            if (!schedule) {
                const addSchedule = await Schedule.create({
                    user_id: user_id,
                    week: week,
                    meals:[]
                });
            }

            const newUser = await newUserData(user_id);

            return res.status(200).json({status:"ok",user:newUser});
        } catch (error) {
            console.log(error);
            res.status(500).json(error.toString())
        }
    },
    addMealSchedule: async (req, res) => {

        const t = await sequelize.transaction();
        const user_id = req.user.id;
        try {
            const {meals, week } = req.body;
            const user = await User.findByPk(user_id, {
                include: ['favorites', { model: Schedule, as: 'schedules', include: 'meals' }]
            });
            // ----- Search Schedule with Id User et Week number
            const schedule = await Schedule.findOne({ where: { user_id, week: week } });


            if (!user) {
                return res.status(400).json(`this user don't exist.`);
            }


            if (!schedule) {
                return res.status(400).json(`schedule don't exist.`);
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
        } catch (error) {
            console.log(error);

            await t.rollback();

            res.status(500).json(error.toString())
        }
    },

    //modifySchedule: async (req, res) => {
//
    //    try {
    //        const schedule_id = req.params.id;
//
    //        const { user_id, meals } = req.body;
//
    //        const user = await User.findByPk(user_id, {
    //            include: ['favorites', { model: Schedule, as: 'schedules', include: 'meals' }]
    //        });
//
    //        // ----- Check if position already exist on the meal
    //        const mealFind = await Meal.findOne({ where: { schedule_id, position: meals.position } });
//
    //        if (!user) {
    //            return res.status(400).json(`this user don't exist.`);
    //        }
//
    //        // ---- if meal not exist, we create meal else we replace
    //        if (!mealFind) {
    //            return res.status(400).json(`this meal don't exist.`);
    //        } else {
    //            // We replace the existing meal
    //            mealFind.idDbMeal = meals.idDbMeal;
    //            mealFind.name = meals.name;
    //            mealFind.image = meals.imageUrl;
    //            mealFind.position = meals.position;
//
    //            mealFind.save()
    //        }
//
    //        return res.status(200).json('ok');
    //    } catch (error) {
    //        console.log(error);
    //        res.status(500).json(error.toString())
    //    }
    //},

    deleteSchedule: async (req, res) => {
        try {
            const meal_id = req.params.id;

            const meal = await Meal.findByPk(meal_id);

            if (!meal) {
                res.status(404).json('Can not find meal with id ' + meal_id);
            } else {

                await Meal.destroy({ where: { id: meal_id } })

                res.status(200).json('Meal_id has been removed');
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error.toString())
        }
    },
};

module.exports = scheduleController
