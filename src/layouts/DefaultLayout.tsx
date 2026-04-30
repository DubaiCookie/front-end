import { Outlet } from "react-router-dom"
import Header from "@/components/common/Header";
import Navigation from "@/components/common/Navigation";
import ChatbotWidget from "@/components/common/ChatbotWidget";

export default function DefaultLayout() {
    return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Navigation />
      <ChatbotWidget />
    </>
  );
}
