from fastapi import FastAPI, Request
from transformers import pipeline

app = FastAPI()
moderator = pipeline( # This also downloads the model and caches it
  "text-classification",
  model = "KoalaAI/Text-Moderation",
  top_k = None
)

@app.post("/predict") # POST so we can send data through the body and not the query parameters
async def predict(request: Request):
  requestBody = await request.json()
  userInput = requestBody.get("input")
  if userInput is None:
    return { "error": "No input provided" }
  moderationResult = moderator(userInput)
  return { "result": moderationResult }
