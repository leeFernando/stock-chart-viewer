export async function GET(request: Request) {
  try {
    const { stocksTicker, multiplier, timespan, from, to, ...params } = Object.fromEntries(new URL(request.url).searchParams.entries())
    const queryParams = new URLSearchParams(params as Record<string, any>).toString()

    const url = `https://api.polygon.io/v2/aggs/ticker/${stocksTicker}/range/${multiplier}/${timespan}/${from}/${to}?${queryParams}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.POLYGON_API_KEY}`
      }
    })
    const data =  await response.json()
  
    return Response.json(data, { status: response.status })
  } catch (error) {
    return Response.json({ error }, { status: 400 })
  }
}