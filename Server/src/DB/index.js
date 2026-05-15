import mongoose from "mongoose"
import dns from "dns"

 const DbConnect=async()=> {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  const res = await mongoose.connect(`${process.env.MONGODB_URL}`);
   console.log("✅ MongoDB Connected Successfully to host:", res.connection.host);

    return res;
    
}
export default DbConnect;