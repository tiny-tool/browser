import { extractFromHtml } from '@extractus/article-extractor';
import rehypeParse from 'rehype-parse';
import rehypeRemoveComments from 'rehype-remove-comments';
import rehypeRemoveExternalScriptContent from 'rehype-remove-external-script-content';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';
import fs from 'fs';

function rehypeRemoveNode() {
  return function (tree: Root) {
    visit(tree, 'element', function (node, index, parent) {
      const needRemove = ['a', 'img', 'audio', 'video', 'script'].includes(node.tagName);
      if (needRemove && typeof index === 'number' && parent) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
}

/**
 * 提取 html 中的有效内容
 * @param html
 */
export async function extractContent(html: string) {
  // const res = await extractFromHtml(html, 'https://www.example.com/dfd79ec1-25fa-4c91-967d-62f271e24827');
  // const text = res && res.content ? res.content : html;

  const file = await unified()
    .use(rehypeParse)
    .use(rehypeRemoveComments)
    .use(rehypeRemoveExternalScriptContent)
    .use(rehypeRemoveNode)
    .use(remarkGfm)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);

  return String(file);
}
