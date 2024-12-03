import './App.css';
import { Routes, Route } from "react-router-dom";
import HomePage from './Pages/HomePage';
import ChatPage from './Pages/ChatPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-app-background bg-cover bg-center">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
