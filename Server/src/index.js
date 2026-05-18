import "dotenv/config";
import DbConnect from "./DB/index.js"
import app from "./app.js"

DbConnect().then(()=>{
    console.log("✅ Database connection established successfully.");
}).catch((err)=>{
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit the process with an error code
});

app.listen(process.env.PORT,()=>{
    console.log(`✅ Server is running on port ${process.env.PORT}`);
}).on("error",(err)=>{
    console.error("❌ Server failed to start:", err);
    process.exit(1); // Exit the process with an error code
});