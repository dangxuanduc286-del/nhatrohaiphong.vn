import { fail, ok } from "@/server/api/response";
import { enforceSearchRateLimit } from "@/server/search/rate-limit";
import { getSearchParamsFromRequest, poiSearch } from "@/server/search/service";
import { poiSearchQuerySchema } from "@/server/search/validators";

export async function GET(request: Request) {
  try {
    await enforceSearchRateLimit(request, "poi");
    const query = poiSearchQuerySchema.parse(getSearchParamsFromRequest(request));
    const data = await poiSearch(query);

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
