import path from "path";
import { fileURLToPath } from "url";

// Khai báo đường dẫn cho môi trường ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configViewEngine = (app) => {
    // Lưu ý: Vì file này nằm trong src/configs/, 
    // ta cần đi ngược ra 1 cấp (..) để vào thư mục views
    app.set("views", path.join(__dirname, "../views"));
    app.set("view engine", "ejs");
    console.log("Đã nạp cấu hình View Engine");
};

export default configViewEngine;