import { ModerateRequest } from "@/lib/constants/moderate";

/**
 * This extra API endpoint exists as to not have problems with CORS
 * + we are sure that whatever we write here is not exposed to the client
 */
export async function POST(request: Request) {
  const apiUrl = `${process.env.API_BASE_URL}/moderate`;

  const requestBody: ModerateRequest = await request.json();
  const requestBodyJson = JSON.stringify(requestBody);

  const apiResponse = await fetch(apiUrl, {
    method: "POST",
    body: requestBodyJson,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return new Response(apiResponse.body, {
    status: apiResponse.status,
    statusText: apiResponse.statusText,
    headers: apiResponse.headers,
  });
}
