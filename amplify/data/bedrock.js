export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt = `Create a practical recipe using these ingredients: ${ingredients.join(
    ", "
  )}. Include a title, ingredient quantities, and numbered instructions.`;

  return {
    resourcePath:
      "/model/anthropic.claude-3-haiku-20240307-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      },
    },
  };
}

export function response(ctx) {
  return {
    body: ctx.result.body,
  };
}
