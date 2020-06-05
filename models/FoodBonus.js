import { FoodType } from "../enums/FoodType.js";
import { BonusType } from "../enums/BonusType.js";

export const FoodBonus = {
    [FoodType.APPLE]: {
        [BonusType.POINTS]: 5
    },
    [FoodType.PEAR]: {
        [BonusType.POINTS]: 10
    },
    [FoodType.GRAPES]: {
        [BonusType.POINTS]: 50
    },
    [FoodType.BOMB]: {
        [BonusType.DEAD]: true
    },
    [FoodType.BOOST]: {
        [BonusType.SPEED]: 2
    },
    [FoodType.SLOWDOWN]: {
        [BonusType.SPEED]: 0.5
    },
    [FoodType.DOUBLE]: {
        [BonusType.MULTIPLY]: 2
    }
};