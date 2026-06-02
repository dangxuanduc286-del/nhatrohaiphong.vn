import { fail, ok } from "@/server/api/response";
import { enforceSearchRateLimit } from "@/server/search/rate-limit";
import { getSearchParamsFromRequest, searchRooms } from "@/server/search/service";
import { searchQuerySchema } from "@/server/search/validators";

export async function GET(request: Request) {
  try {
    await enforceSearchRateLimit(request, "rooms");
    const query = searchQuerySchema.parse(getSearchParamsFromRequest(request));
    const data = await searchRooms(query);

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
