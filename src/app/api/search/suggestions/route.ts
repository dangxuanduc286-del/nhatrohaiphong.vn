import { fail, ok } from "@/server/api/response";
import { enforceSearchRateLimit } from "@/server/search/rate-limit";
import { getSearchParamsFromRequest, getSuggestions } from "@/server/search/service";
import { suggestionsQuerySchema } from "@/server/search/validators";

export async function GET(request: Request) {
  try {
    await enforceSearchRateLimit(request, "suggestions");
    const query = suggestionsQuerySchema.parse(getSearchParamsFromRequest(request));
    const data = await getSuggestions(query);

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}
