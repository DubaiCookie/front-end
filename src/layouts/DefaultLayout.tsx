import { Outlet } from "react-router-dom"
import Header from "@/components/common/Header";
import Navigation from "@/components/common/Navigation";

export default function DefaultLayout() {
    return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Navigation />
    </>
  );
}
