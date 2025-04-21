from collections.abc import Generator
from typing import Any

import requests

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

API_URL = "https://salaries-cs-translate-sage.trycloudflare.com/api/v1/search"

class BrowserSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage]:
        params = {
            "q": tool_parameters["query"],
            "engine": "baidu",
        }

        response = requests.get(url=API_URL, params=params, timeout=15)
        response.raise_for_status()
        
        valuable_res = response.json()
        print('valuable_res', valuable_res)
        
        yield self.create_json_message(valuable_res)