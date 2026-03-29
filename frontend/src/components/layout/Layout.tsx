import { Outlet } from "react-router";
import BottomNav from "./BottomNav";

function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export default Layout;
