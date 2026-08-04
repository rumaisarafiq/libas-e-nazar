import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WardrobeProvider } from "./context/WardrobeContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import TryOn from "./pages/TryOn";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WardrobeProvider>
            <div className="flex min-h-screen flex-col">
              <ScrollToTop />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/try-on" element={<TryOn />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </WardrobeProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
