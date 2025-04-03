import { extractFromHtml } from "@extractus/article-extractor";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

/**
 * 提取 html 中的有效内容
 * @param html
 */
export async function extractContent(html: string) {
  const res = await extractFromHtml(html);
  const text = res && res.content ? res.content : html;

  const file = await unified()
    .use(rehypeParse)
    .use(remarkGfm)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(text);

  return String(file);
}
