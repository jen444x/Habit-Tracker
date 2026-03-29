import { Outlet } from "react-router";
import BottomNav from "./BottomNav";

function Layout() {
  return (
    <>
      <div className="pb-20">
        {" "}
        {/* padding-bottom for nav height */}
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

export default Layout;
