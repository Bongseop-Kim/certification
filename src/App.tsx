import { ActionButton, Box } from '@seed-design/react'

export default function App() {
  return (
    <Box display="flex" flexDirection="column" gap="x4" p="x6" maxWidth="640px" mx="auto">
      <ActionButton>SEED 연결 확인</ActionButton>
      <ActionButton variant="neutralWeak">보조 버튼</ActionButton>
    </Box>
  )
}
