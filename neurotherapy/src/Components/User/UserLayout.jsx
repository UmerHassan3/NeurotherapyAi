import { Outlet } from "react-router-dom";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";

export default function UserLayout() {
    return (
        <div>
            <UserHeader />

            <main>
                <Outlet />
            </main>

            <UserFooter />
        </div>
    );
}