import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { Grommet } from "grommet";
import { SelectionContextProvider } from "./SelectionContext";
import AboutPage from "./AboutPage";
import MapPage from "./MapPage";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const theme = {
  global: {
    colors: {
      brand: "#228BE6",
    },
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

function App() {
  return (
    <ApolloProvider client={client}>
      <SelectionContextProvider>
        <Grommet theme={theme} full>
          <Router>
            <Route key="map" path="/" exact component={MapPage} />
            <Route key="about" path="/about" exact component={AboutPage} />
          </Router>
        </Grommet>
      </SelectionContextProvider>
    </ApolloProvider>
  );
}

export default App;
