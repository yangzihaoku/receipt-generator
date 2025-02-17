import { NextResponse } from 'next/server';
import { Client, PlaceType1, Language } from '@googlemaps/google-maps-services-js';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

// 创建 Google Maps 客户端
const client = new Client({});

// 定义错误响应的接口
interface ErrorResponse {
  response: {
    status: number;
    data: {
      error_message?: string;
    };
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!GOOGLE_PLACES_API_KEY) {
    console.error('API key is not configured');
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const textSearchResponse = await client.textSearch({
      params: {
        query: query,
        key: GOOGLE_PLACES_API_KEY,
        type: PlaceType1.restaurant,
        language: Language.en
      }
    });

    console.log('Text search response:', textSearchResponse.data);

    if (textSearchResponse.data.results?.length > 0) {
      const firstResult = textSearchResponse.data.results[0];
      
      // 确保 place_id 存在
      if (!firstResult.place_id) {
        return NextResponse.json({
          error: 'Place ID not found in search results'
        }, { status: 404 });
      }

      const placeDetailsResponse = await client.placeDetails({
        params: {
          place_id: firstResult.place_id,
          key: GOOGLE_PLACES_API_KEY,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'place_id'],
          language: Language.en
        }
      });

      console.log('Place details response:', placeDetailsResponse.data);

      const placeDetails = placeDetailsResponse.data.result;
      return NextResponse.json({
        results: [{
          ...firstResult,
          ...placeDetails
        }]
      });
    }

    return NextResponse.json({ results: [] });

  } catch (error: unknown) {
    console.error('API Route - Error:', error);
    
    // 类型守卫：检查错误是否符合 ErrorResponse 接口
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = error as ErrorResponse;
      const { status, data } = errorResponse.response;
      return NextResponse.json({
        error: 'Google Places API error',
        details: data.error_message || 'Unknown error',
        status
      }, { status });
    }

    return NextResponse.json({
      error: 'Failed to fetch place data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 