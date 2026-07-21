import path from "path";

export default {
    development: {
        dialect: "sqlite",
        storage: path.resolve(process.env.DEV_NAME),
        logging: false
    }
}