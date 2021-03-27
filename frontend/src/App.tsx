import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import { Grommet } from "grommet";
import { hp } from "grommet-theme-hp";
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

function App() {
  return (
    <ApolloProvider client={client}>
      <SelectionContextProvider>
        <Grommet theme={hp} full>
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
