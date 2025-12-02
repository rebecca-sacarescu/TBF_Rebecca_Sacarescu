import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
    return (
        <Theme appearance="inherit" radius="large" scaling="100%">
            <Router>
                <main className="min-h-screen font-inter">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        newestOnTop
                        closeOnClick
                        pauseOnHover
                        className="z-50"
                    />
                </main>
            </Router>
        </Theme>
    );
};

export default App;