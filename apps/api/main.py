from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from contextlib import asynccontextmanager
from asyncio import wait_for, TimeoutError
from transformers import pipeline
from pprint import pprint

MIN_USER_QUERY_LENGTH = 10;
MAX_USER_QUERY_LENGTH = 1000;

MAX_INFERENCE_TIME = 10; # seconds

'''
Could've just initialized the moderator globally, but I opted for fully using the FastAPI best practices.
Also, it's nice that we can store stuff in `app.state`.
'''
@asynccontextmanager
async def execute_lifecycle(app: FastAPI):
  app.state.moderator = pipeline( # This also downloads the model and caches it
    "text-classification",
    model = "KoalaAI/Text-Moderation",
    top_k = None # returns all labels, not just the top k
  )
  yield
  # Statements written beyond this point are executed when the application shuts down

# =========
app = FastAPI(lifespan = execute_lifecycle)
# =========

@app.post("/moderate") # POST so we can send data through the body and not the query parameters
async def post_moderate(request: Request):
  requestBody = await request.json()
  print("requestBody:")
  pprint(requestBody)

  userQuery = requestBody.get("userQuery")
  print("userQuery:")
  pprint(userQuery)

  if userQuery is None:
    return JSONResponse(
      status_code = status.HTTP_400_BAD_REQUEST,
      content = { "success": False, "error": "No query provided" }
    )

  if len(userQuery) < MIN_USER_QUERY_LENGTH:
    return JSONResponse(
      status_code = status.HTTP_400_BAD_REQUEST,
      content = { "success": False, "error": f"Query too short (minimum {MIN_USER_QUERY_LENGTH} characters)" }
    )

  if len(userQuery) > MAX_USER_QUERY_LENGTH:
    return JSONResponse(
      status_code = status.HTTP_400_BAD_REQUEST,
      content = { "success": False, "error": f"Query too long (maximum {MAX_USER_QUERY_LENGTH} characters)" }
    )

  try:
    # Improve speed by running in the threadpool & improve resource management by setting a timeout to the operation
    moderationResult = await wait_for(
      run_in_threadpool(app.state.moderator, userQuery),
      timeout = MAX_INFERENCE_TIME
    )

    # Convention: success responses can be simplified as below; the default status code is 200
    return { "success": True, "data": moderationResult }
  except TimeoutError as timeoutError:
    print("A timeout error occurred:")
    print(timeoutError)

    return JSONResponse(
      status_code = status.HTTP_504_GATEWAY_TIMEOUT,
      content = { "success": False, "error": f"Moderation timed out after {MAX_INFERENCE_TIME} seconds" }
    )
  except MemoryError as memoryError:
    print("A memory error occurred:")
    print(memoryError)

    return JSONResponse(
      status_code = status.HTTP_503_SERVICE_UNAVAILABLE,
      content = { "success": False, "error": "Moderation failed due to memory error" }
    )
  except Exception as exception:
    print("An unexpected error occurred:")
    print(exception)

    return JSONResponse(
      status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
      content = { "success": False, "error": f"An unexpected error occurred" }
    )
