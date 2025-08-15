import { createRoot } from 'react-dom/client';
import './globals.css';
import AppProvider from './providers/appProvider/index.tsx';

createRoot(document.getElementById('root')!).render(<AppProvider />);
