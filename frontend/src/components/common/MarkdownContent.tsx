import { Box, type SxProps, type Theme } from "@mui/material";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  children: string;
  className?: string;
  sx?: SxProps<Theme>;
}

const markdownComponents: Components = {
  table: ({ node: _node, ...props }) => (
    <Box className="markdown-table-scroll" role="region" tabIndex={0}>
      <table {...props} />
    </Box>
  ),
};

export function MarkdownContent({ children, className, sx }: MarkdownContentProps) {
  const sxOverrides = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Box
      className={className}
      sx={[
        {
          color: "inherit",
          overflowWrap: "anywhere",
          "& p": {
            margin: 0,
            marginBottom: "0.5em",
            "&:last-child": { marginBottom: 0 },
          },
          "& strong": {
            fontWeight: 600,
            color: "inherit",
          },
          "& em": {
            fontStyle: "italic",
          },
          "& ul, & ol": {
            margin: "0.5em 0",
            paddingLeft: "1.5em",
          },
          "& li": {
            marginBottom: "0.25em",
          },
          "& code": {
            backgroundColor: "action.hover",
            padding: "0.1em 0.4em",
            borderRadius: "3px",
            fontSize: "0.9em",
            fontFamily: "monospace",
          },
          "& pre": {
            backgroundColor: "action.hover",
            padding: "0.75em",
            borderRadius: "6px",
            overflow: "auto",
            "& code": {
              backgroundColor: "transparent",
              padding: 0,
            },
          },
          "& blockquote": {
            borderLeft: "3px solid",
            borderColor: "divider",
            marginLeft: 0,
            paddingLeft: "1em",
            color: "text.secondary",
          },
          "& a": {
            color: "primary.main",
            textDecoration: "underline",
          },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            margin: "0.5em 0 0.25em",
            fontWeight: 600,
            color: "inherit",
          },
          "& .markdown-table-scroll": {
            width: "100%",
            maxWidth: "100%",
            my: 1,
            overflowX: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            WebkitOverflowScrolling: "touch",
          },
          "& table": {
            width: "100%",
            minWidth: 360,
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "0.8125rem",
            lineHeight: 1.45,
          },
          "& th, & td": {
            px: 1,
            py: 0.75,
            textAlign: "left",
            verticalAlign: "top",
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          },
          "& th:last-of-type, & td:last-of-type": {
            borderRight: 0,
          },
          "& tbody tr:last-of-type td": {
            borderBottom: 0,
          },
          "& th": {
            fontWeight: 600,
            bgcolor: "action.hover",
            color: "text.primary",
            whiteSpace: "nowrap",
          },
          "& td": {
            color: "inherit",
          },
        },
        ...sxOverrides,
      ]}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {children}
      </ReactMarkdown>
    </Box>
  );
}
