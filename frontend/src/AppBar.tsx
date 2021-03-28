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
    >
      <Box direction="row">
        <Anchor href="/" label="Map" margin="xsmall" color="light-1" />
        <Anchor href="/about" label="About" margin="xsmall" color="light-1" />
      </Box>

      {props.children}
    </Box>
  );
}
