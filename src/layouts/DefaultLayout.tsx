import { Outlet } from "react-router-dom"
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Navigation from "@/components/common/Navigation";

export default function DefaultLayout() {
    return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
      <Navigation />
    </>
  );
}