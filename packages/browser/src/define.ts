export interface OrganicResult {
  // 标题
  title: string;
  // 站点名称
  displayed_link: string;
  // 连接
  link: string;
  // 内容
  snippet: string;

  position: number;

  // 完整 html 数据
  full_content: string;
}

export interface Result {
  organic_results: OrganicResult[];
}
