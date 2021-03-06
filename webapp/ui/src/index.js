import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';

import configureStore from "./app/store/configureStore";
const store = configureStore();

// Save a reference to the root element for reuse
const rootEl = document.getElementById("root");

// Create a reusable render method that we can call more than once
let render = () => {
    // Dynamically import our main App component, and render it
    const App = require("./app/layout/App").default;

    ReactDOM.render(
	<BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
	</BrowserRouter>,
        rootEl
    );
};

if(module.hot) {
    // Support hot reloading of components.
    // Whenever the App component file or one of its dependencies
    // is changed, re-import the updated component and re-render it
    module.hot.accept("./app/layout/App", () => {
        setTimeout(render);
    });
}

render();

