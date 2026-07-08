import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = {};
const basePath = path.join(__dirname);

const files = fs.readdirSync(basePath);

for (const file of files) {
    if (
        file === "index.js" ||
        !file.endsWith(".js")
    ) continue;
    
    const name = (file.replace(".js", "").replace(/-([a-z])/g, (_, char) => char.toUpperCase()));
    const modulePath = pathToFileURL(path.join(basePath, file)).href;

    const module = await import(modulePath);

    services[name] = module.default || module;
}

export default services;