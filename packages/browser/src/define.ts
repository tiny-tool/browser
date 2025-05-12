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

export interface SearchOptions {
  /**
   * 是否解析链接
   * 搜索引擎返回的链接是个加密链接，是否解析到真实链接
   */
  resolveUrl?: boolean;
  /**
   * 是否获取搜索结果的完整内容
   */
  fullContent?: boolean;
  /**
   * 搜索结果的数量限制
   */
  limit?: number;
  /**
   * 是否移除不可见元素
   */
  removeInvisibleElements?: boolean;
}
