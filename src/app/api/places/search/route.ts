import { NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

// 创建 Google Maps 客户端
const client = new Client({});

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
    // 使用 Places API 文本搜索
    const textSearchResponse = await client.textSearch({
      params: {
        query: query,
        key: GOOGLE_PLACES_API_KEY,
        type: 'restaurant',
        language: 'en'
      }
    });

    console.log('Text search response:', textSearchResponse.data);

    if (textSearchResponse.data.results?.length > 0) {
      // 获取第一个结果的详细信息
      const placeId = textSearchResponse.data.results[0].place_id;
      
      const placeDetailsResponse = await client.placeDetails({
        params: {
          place_id: placeId,
          key: GOOGLE_PLACES_API_KEY,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'place_id'],
          language: 'en'
        }
      });

      console.log('Place details response:', placeDetailsResponse.data);

      const placeDetails = placeDetailsResponse.data.result;
      return NextResponse.json({
        results: [{
          ...textSearchResponse.data.results[0],
          ...placeDetails
        }]
      });
    }

    return NextResponse.json({ results: [] });

  } catch (error) {
    console.error('API Route - Error:', error);
    
    // 错误处理
    if (error.response) {
      const { status, data } = error.response;
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