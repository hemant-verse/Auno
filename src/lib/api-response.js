import { NextResponse } from 'next/server';

export function apiSuccess(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function apiError(error, status = 500, details) {
  const payload = { success: false, error };

  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

export function validationError(result) {
  return apiError(
    'Validation failed',
    400,
    result.error.issues.map((issue) => ({
      fieldName: issue.path,
      message: issue.message,
    }))
  );
}