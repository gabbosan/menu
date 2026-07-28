import React from 'react';
import { createRoot } from 'react-dom/client';
import AppCliente from './AppCliente';
import AppLojista from './AppLojista';
import './App.css';

const ehLojista = new URLSearchParams(window.location.search).has('lojista');

const root = createRoot(document.getElementById('root'));
root.render(ehLojista ? <AppLojista /> : <AppCliente />);
