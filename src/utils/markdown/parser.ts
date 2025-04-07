interface MarkdownNode {
  text: string;
  subsections: Record<string, MarkdownNode>;
}

export default (markdown: string): Record<string, MarkdownNode> => {
  const lines = markdown.split("\n");
  const stack: { level: number; node: MarkdownNode }[] = [];
  const root: Record<string, MarkdownNode> = {};
  let currentNode: MarkdownNode | null = null;

  lines.forEach((line) => {
    const match = line.match(/^(#+)\s*(.*)/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const newNode: MarkdownNode = { text: "", subsections: {} };

      while (stack.length && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length) {
        stack[stack.length - 1].node.subsections[title] = newNode;
      } else {
        root[title] = newNode;
      }

      stack.push({ level, node: newNode });
      currentNode = newNode;
    } else if (line.trim() && currentNode) {
      currentNode.text += (currentNode.text ? "\n" : "") + line.trim();
    }
  });

  return root;
};
