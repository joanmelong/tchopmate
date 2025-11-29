import { NextRequest, NextResponse } from 'next/server';

// GET /api/gerant/restaurants
export async function GET() {
  try {
    // TODO: Implement restaurant fetching logic for gerant
    return NextResponse.json({ restaurants: [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/gerant/restaurants
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement restaurant creation logic for gerant
    const body = await request.json();
    return NextResponse.json({ message: 'Restaurant created', data: body }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
