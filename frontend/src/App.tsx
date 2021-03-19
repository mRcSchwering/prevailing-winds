import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  Box,
  Button,
  Heading,
  Collapsible,
  Grommet,
  ResponsiveContext,
  Layer,
  Text,
} from "grommet";
import { Notification, FormClose } from "grommet-icons";
import { useTestPkl, TestPklData } from "./queries";

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

function AppBar(props: any): JSX.Element {
  return (
    <Box
      tag="header"
      direction="row"
      align="center"
      justify="between"
      background="brand"
      pad={{ left: "medium", right: "small", vertical: "small" }}
      elevation="medium"
      style={{ zIndex: 1 }}
      {...props}
    />
  );
}

function AppBody(): JSX.Element {
  return (
    <Box flex align="center" justify="center">
      app body
    </Box>
  );
}

function SideBarContent(props: {
  data?: TestPklData;
  loadData: () => void;
}): JSX.Element {
  return (
    <>
      sidebar
      <Button primary label="get data" onClick={props.loadData} />
      <Text>N Records: {props.data?.length}</Text>
    </>
  );
}

function AppContent(): JSX.Element {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [loadTestPkl, { data }] = useTestPkl();
  const size = React.useContext(ResponsiveContext);

  return (
    <Box fill>
      <AppBar>
        <Heading level="3" margin="none">
          My App
        </Heading>
        <Button
          icon={<Notification />}
          onClick={() => setShowSidebar(!showSidebar)}
        />
      </AppBar>
      <Box direction="row" flex overflow={{ horizontal: "hidden" }}>
        <AppBody />
        {!showSidebar || size !== "small" ? (
          <Collapsible direction="horizontal" open={showSidebar}>
            <Box
              flex
              width="medium"
              background="light-2"
              elevation="small"
              align="center"
              justify="center"
            >
              <SideBarContent data={data} loadData={loadTestPkl} />
            </Box>
          </Collapsible>
        ) : (
          <Layer>
            <Box
              background="light-2"
              tag="header"
              justify="end"
              align="center"
              direction="row"
            >
              <Button
                icon={<FormClose />}
                onClick={() => setShowSidebar(false)}
              />
            </Box>
            <Box fill background="light-2" align="center" justify="center">
              <SideBarContent data={data} loadData={loadTestPkl} />
            </Box>
          </Layer>
        )}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Grommet theme={theme} full>
        <AppContent />
      </Grommet>
    </ApolloProvider>
  );
}

export default App;
