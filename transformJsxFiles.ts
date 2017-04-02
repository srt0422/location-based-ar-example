import * as fs from 'fs';
import * as path from "path";

let jsxPath = path.join(__dirname, "app");

transformJsxFiles(jsxPath);

export function transformJsxFiles(pathName) {

    let pathNameObject = path.parse(pathName);

    let files = fs.readdirSync(pathName);

    files.forEach((name) => {

        let pathObject = path.parse(name);

        if (pathObject.ext === ".jsx") {
            fs.renameSync(path.join(pathName, name), path.join(pathName, `${pathObject.name}.js`));
        }

        if (pathObject.ext === "" && name.indexOf(".") !== 0) {
            transformJsxFiles(path.join(pathName, name));
        }
    });
};
