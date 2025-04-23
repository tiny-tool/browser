export interface OrganicResult {
  /**
   * 标题
   */
  title: string;
  /**
   * 站点名称
   */
  displayed_link: string;
  /**
   * 链接
   */
  link: string;
  /**
   * 在搜索结果页上展示出来的内容
   */
  snippet: string;

  position: number;

  /**
   * 完整 html 数据
   */
  full_content: string;
}

export interface Result {
  organic_results: OrganicResult[];
}
