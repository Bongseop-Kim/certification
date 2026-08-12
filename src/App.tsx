import { Box, Text } from '@seed-design/react'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export type Question = {
  id: number
  type: 'mc' | 'ox' | 'short'
  category: string | null
  body: string
  choices: string[] | null
  answer: string
  explanation: string | null
}

export const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string>()

  useEffect(() => {
    // ponytail: 전량 로드. 수천 개 넘어 느려지면 .range() 페이지네이션
    sb.from('questions')
      .select('*')
      .order('id')
      .then(({ data, error }) => (error ? setError(error.message) : setQuestions(data)))
  }, [])

  return (
    <Box display="flex" flexDirection="column" gap="x4" p="x6" maxWidth="640px" mx="auto">
      <Text as="h1" textStyle="t7Bold">
        자격증 문제 ({questions.length})
      </Text>
      {error && (
        <Text textStyle="t4Regular" color="fg.critical">
          {error}
        </Text>
      )}
      {questions.map((q) => (
        <Box key={q.id} p="x4" borderWidth={1} borderColor="stroke.neutralMuted" borderRadius="r2">
          <Text textStyle="t4Regular">
            [{q.type}] {q.body}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
