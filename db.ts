import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
});

export const PositionInfoDB = sequelize.define("PositionInfo", {
    token0Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token1Name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token0Amount: {
        type: DataTypes.FLOAT,
    },
    token1Amount: {
        type: DataTypes.FLOAT,
    },
    token0Price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    token1Price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
});

export async function connectToDB() {
    try {
        await sequelize.authenticate();
        await PositionInfoDB.sync();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

export async function findAll() {
    const positions = await PositionInfoDB.findAll();
    return positions;
}
