import { ApiErrorResponse, ApiSuccessfulResponse } from "@/lib/constants/api";
import {
  maxConcurrentRequests,
  maxTotalRequests,
  ModerateLoadTestRequest,
  ModerateLoadTestSuccessfulResponse,
  ModerateRequest,
} from "@/lib/constants/moderate";
import autocannon, { Request as AutocannonRequest } from "autocannon";
import { StatusCodes } from "http-status-codes";

/**
 * This extra API endpoint exists as to not have problems with CORS
 * + we are sure that whatever we write here is not exposed to the client
 * + it makes sense for the load testing to be performed by an actual server; the client only needs to display the results
 */
export async function POST(request: Request) {
  const apiUrl = `${process.env.API_BASE_URL}/moderate`;

  const requestBody = (await request.json()) as ModerateLoadTestRequest;

  if (requestBody.queryPool.length == 0) {
    const errorResponse = buildErrorResponse("Query pool cannot be empty!");
    return errorResponse;
  }

  if (requestBody.totalRequests <= 0) {
    const errorResponse = buildErrorResponse(
      "Total requests must be higher than or equal to 1!"
    );
    return errorResponse;
  }

  if (requestBody.concurrentRequests > maxTotalRequests) {
    const errorResponse = buildErrorResponse(
      `Total requests must be lower than or equal to ${maxTotalRequests}!`
    );
    return errorResponse;
  }

  if (requestBody.concurrentRequests <= 0) {
    const errorResponse = buildErrorResponse(
      "Concurrent requests must be higher than or equal to 1!"
    );
    return errorResponse;
  }

  if (requestBody.concurrentRequests > maxConcurrentRequests) {
    const errorResponse = buildErrorResponse(
      `Concurrent requests must be lower than or equal to ${maxConcurrentRequests}!`
    );
    return errorResponse;
  }

  const requests = Array.from({ length: requestBody.totalRequests }, () => {
    const queryIndex = Math.floor(Math.random() * requestBody.queryPool.length);
    const query = requestBody.queryPool[queryIndex];
    const body: ModerateRequest = {
      userQuery: query,
    };
    const bodyJson = JSON.stringify(body);

    const autocannonRequest: AutocannonRequest = {
      body: bodyJson,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return autocannonRequest;
  });

  const autocannonResult = await autocannon({
    url: apiUrl,
    requests,
    amount: requestBody.totalRequests,
    connections: requestBody.concurrentRequests,
  });

  const successfulResponseContent: ModerateLoadTestSuccessfulResponse = {
    success: true,
    data: autocannonResult,
  };
  const successfulResponseContentJson = JSON.stringify(
    successfulResponseContent
  );

  return new Response(successfulResponseContentJson, {
    status: StatusCodes.OK,
  });
}

const buildErrorResponse = (message: string) => {
  const errorResponseContent: ApiErrorResponse = {
    success: false,
    error: message,
  };
  const errorResponseContentJson = JSON.stringify(errorResponseContent);

  return new Response(errorResponseContentJson, {
    status: StatusCodes.BAD_REQUEST,
  });
};
