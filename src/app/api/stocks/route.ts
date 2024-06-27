export async function GET(request: Request) {
  try {
    const queryParams = new URL(request.url).searchParams.toString()

    const url = `https://api.polygon.io/v3/reference/tickers?${queryParams}`
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