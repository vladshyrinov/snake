import { SoundType } from "../enums/SoundType.js";
import { FoodType } from "../enums/FoodType.js";

export const SoundFileName = {
    [SoundType.FOOD]: {
        [FoodType.BOMB]: "bomb",
        [FoodType.DOUBLE]: "double",
        [FoodType.SLOWDOWN]: "slowdown",
        [FoodType.BOOST]: "speed",
        [FoodType.GRAPES]: "points",
        [FoodType.PEAR]: "points",
        [FoodType.APPLE]: "points"
    },
    [SoundType.HITWALL]: "fail",
    [SoundType.CUT]: "scissors"
};