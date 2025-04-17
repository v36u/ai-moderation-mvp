from fastapi import FastAPI, Request
from transformers import pipeline
from pprint import pprint

app = FastAPI()
moderator = pipeline( # This also downloads the model and caches it
  "text-classification",
  model = "KoalaAI/Text-Moderation",
  top_k = None
)

@app.post("/moderate") # POST so we can send data through the body and not the query parameters
async def moderate(request: Request):
  requestBody = await request.json()
  print("requestBody:")
  pprint(requestBody)

  userInput = requestBody.get("input")
  print("userInput:")
  pprint(userInput)

  if userInput is None:
    return { "success": False, "error": "No input provided" }

  moderationResult = moderator(userInput)

  return { "success": True, "data": moderationResult }
