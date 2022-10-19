import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { Grommet, grommet } from "grommet";
import { deepMerge } from "grommet/utils";
import { SelectionContextProvider } from "./SelectionContext";
import AboutPage from "./AboutPage";
import MapPage from "./MapPage";
import { COLORS } from "./constants";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const myTheme = deepMerge(grommet, {
  global: {
    colors: {
      brand: COLORS.darkGray,
      "accent-1": "white",
      background: "white",
    },
    focus: { outline: { size: "none" } },
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <SelectionContextProvider>
        <Grommet theme={myTheme} full>
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
