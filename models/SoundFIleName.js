import { SoundType } from "../enums/SoundType.js";
import { FoodType } from "../enums/FoodType.js";

export const SoundFileName = {
    [SoundType.Food]: {
        [FoodType.BOMB]: "bomb",
        [FoodType.DOUBLE]: "double",
        [FoodType.SLOWDOWN]: "slowdown",
        [FoodType.BOOST]: "speed",
        [FoodType.BANANA]: "points",
        [FoodType.PEAR]: "points",
        [FoodType.APPLE]: "points"
    },
    [SoundType.HitWall]: "fail",
    [SoundType.Cut]: "scissors"
};