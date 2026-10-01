// supabase/functions/get-posts/index.ts
import { createClient } from 'https://esm.sh'

// 프론트엔드 크로스 도메인(CORS) 에러 방지용 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 프론트엔드에서 오는 preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Edge Function 내부 환경변수에서 마스터키(service_role)를 가져와 DB 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. 백엔드 영역에서 안전하게 DB 조회 (테이블명 등이 서버 안에 숨겨짐)
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*')

    if (error) throw error

    // 3. 결과를 JSON 형태로 프론트엔드에 리턴
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
