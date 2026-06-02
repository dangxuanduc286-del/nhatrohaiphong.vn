import { fail, ok } from "@/server/api/response";
import { enforceSearchRateLimit } from "@/server/search/rate-limit";
import { getSearchParamsFromRequest, nearbySearch } from "@/server/search/service";
import { nearbyQuerySchema } from "@/server/search/validators";

export async function GET(request: Request) {
  try {
    await enforceSearchRateLimit(request, "nearby");
    const query = nearbyQuerySchema.parse(getSearchParamsFromRequest(request));
    const data = await nearbySearch(query);

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
