import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

interface MathMarkdownProps {
  children: string;
  className?: string;
}

/**
 * Renders Markdown content with full LaTeX math formula support via KaTeX.
 * Supports both inline math ($...$) and display math ($$...$$).
 */
export function MathMarkdown({ children, className }: MathMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Ensure code blocks render cleanly
          code({ className: codeClass, children: codeChildren, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || "");
            const isBlock = Boolean(match);
            return isBlock ? (
              <pre className="bg-muted rounded-md p-3 overflow-x-auto text-sm my-2">
                <code className={codeClass} {...props}>
                  {codeChildren}
                </code>
              </pre>
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {codeChildren}
              </code>
            );
          },
          // Style paragraphs
          p({ children: pChildren }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{pChildren}</p>;
          },
          // Style headings
          h1({ children: hChildren }) {
            return <h1 className="text-lg font-bold mt-3 mb-1">{hChildren}</h1>;
          },
          h2({ children: hChildren }) {
            return <h2 className="text-base font-bold mt-3 mb-1">{hChildren}</h2>;
          },
          h3({ children: hChildren }) {
            return <h3 className="text-sm font-bold mt-2 mb-1">{hChildren}</h3>;
          },
          // Style lists
          ul({ children: ulChildren }) {
            return <ul className="list-disc list-inside mb-2 space-y-0.5">{ulChildren}</ul>;
          },
          ol({ children: olChildren }) {
            return <ol className="list-decimal list-inside mb-2 space-y-0.5">{olChildren}</ol>;
          },
          li({ children: liChildren }) {
            return <li className="text-sm leading-relaxed">{liChildren}</li>;
          },
          // Style blockquotes
          blockquote({ children: bqChildren }) {
            return (
              <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-2">
                {bqChildren}
              </blockquote>
            );
          },
          // Style tables
          table({ children: tChildren }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="text-sm border-collapse w-full">{tChildren}</table>
              </div>
            );
          },
          th({ children: thChildren }) {
            return (
              <th className="border border-border px-2 py-1 bg-muted font-semibold text-left">
                {thChildren}
              </th>
            );
          },
          td({ children: tdChildren }) {
            return (
              <td className="border border-border px-2 py-1">{tdChildren}</td>
            );
          },
          // Style strong/em
          strong({ children: sChildren }) {
            return <strong className="font-semibold">{sChildren}</strong>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
