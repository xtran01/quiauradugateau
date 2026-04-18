import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home        from "./pages/Home";
import HostSetup   from "./pages/HostSetup";
import HostLive    from "./pages/HostLive";
import PlayerJoin  from "./pages/PlayerJoin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/host"                element={<HostSetup />} />
        <Route path="/host/:sessionId/live" element={<HostLive />} />
        <Route path="/join"                element={<PlayerJoin />} />
        <Route path="/join/:code"          element={<PlayerJoin />} />
      </Routes>
    </BrowserRouter>
  );
}