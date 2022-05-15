import React from "react";
import { Box, Anchor } from "grommet";

type AppBarProps = {
  children?: React.ReactNode;
};

export default function AppBar(props: AppBarProps): JSX.Element {
  return (
    <Box
      tag="header"
      direction="row"
      align="center"
      justify="between"
      background="brand"
      pad={{ left: "medium", right: "medium", vertical: "xsmall" }}
      elevation="medium"
      margin="none"
      height="50px"
    >
      <Box direction="row" width="100%" justify="between">
        <Box direction="row">
          <Anchor href="/" label="Map" margin="xsmall" />
          <Anchor href="/about" label="About" margin="xsmall" />
        </Box>
      </Box>

      {props.children}
    </Box>
  );
}
