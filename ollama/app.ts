import ollama from "ollama";

async function callBrowerSearch(args) {
  const { query } = args;
  const url = `http://127.0.0.1:3000/api/v1/search?q=${encodeURIComponent(
    query
  )}&engine=baidu`;
  const response = await fetch(url);
  const res = await response.json();

  return res;
}

const browerSearch = {
  type: "function",
  function: {
    name: "browerSearch",
    description: "get web sreach results",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", description: "search keyword" },
      },
    },
  },
};

async function run(model: string) {
  const messages = [{ role: "user", content: "杭州今天的天气如何" }];
  console.log("Prompt:", messages[0].content);

  const availableFunctions = {
    browerSearch: callBrowerSearch,
  };

  const response = await ollama.chat({
    model: model,
    messages: messages,
    tools: [browerSearch],
  });

  let output: string;
  if (response.message.tool_calls) {
    // Process tool calls from the response
    for (const tool of response.message.tool_calls) {
      const functionToCall = availableFunctions[tool.function.name];
      if (functionToCall) {
        console.log("Calling function:", tool.function.name);
        console.log("Arguments:", tool.function.arguments);
        output = await functionToCall(tool.function.arguments);
        console.log("Function output:", output);

        // Add the function response to messages for the model to use
        messages.push(response.message);
        messages.push({
          role: "tool",
          content: JSON.stringify(output),
        });
      } else {
        console.log("Function", tool.function.name, "not found");
      }
    }

    // Get final response from model with function outputs
    const finalResponse = await ollama.chat({
      model: model,
      messages: messages,
    });
    console.log("Final response:", finalResponse.message.content);
  } else {
    console.log("No tool calls returned from model");
    console.log("Model response:", response.message.content);
  }
}

run("qwen2.5:14b").catch((error) => console.error("An error occurred:", error));
