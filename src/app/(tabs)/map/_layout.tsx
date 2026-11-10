import { Stack } from 'expo-router';

export default function Layout() {
  return (
    // 지도 탭 화면들은 바탕이 모두 같은 지도라서, 안드로이드 기본 전환(아래에서 살짝 올라옴)이면 화면이 바뀌지 않고
    // 버튼·패널만 생기는 것처럼 보인다. 오른쪽에서 밀려 들어오게 해서 다른 화면으로 넘어간 것이 보이게 한다.
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Figma처럼 검색 창 아래로 지도 홈이 비쳐 보이도록 투명 모달로 띄운다. */}
      <Stack.Screen name="search" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
