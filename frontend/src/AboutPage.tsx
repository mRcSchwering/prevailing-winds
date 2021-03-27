import React from "react";
import { Box, Heading, Paragraph } from "grommet";
import AppBar from "./AppBar";

export default function AboutPage(): JSX.Element {
  return (
    <Box fill>
      <AppBar />
      <Box flex align="center" pad="medium" overflow={{ horizontal: "hidden" }}>
        <Heading level="3">About</Heading>
        <Paragraph>
          Some text Some text Some text Some text Some text Some text Some
          textSome textSome textSome text Some text
        </Paragraph>
      </Box>
    </Box>
  );
}
