import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { colors } from '@/constants/colors';
import { radius, sectionGap, spacing } from '@/constants/layout';
import { BlurPhoto } from '@/features/auth/components/blur-photo';
import { relationOptions, type SurveyAnswers } from '@/features/auth/constants/survey-options';

type SurveyDoneProps = {
  answers: SurveyAnswers;
  /** 고른 자리 해시태그 이름 (서버 태그 id를 이름으로 바꾼 것) */
  placeNames: string[];
  nickname: string;
  /** 근처 흐린 사진 수. 위치를 모르면 null이고, null·0이면 숫자 없는 문구를 쓴다 */
  nearbySpotCount: number | null;
};

/** 설문 완료: 고른 취향을 요약하고 지도로 보낸다 */
export function SurveyDone({ answers, placeNames, nickname, nearbySpotCount }: SurveyDoneProps) {
  const relationTitle = relationOptions.find((option) => option.id === answers.relation)?.title ?? '-';
  const walkItems: string[] = [...answers.walkTimes, ...(answers.walkDuration ? [answers.walkDuration] : [])];
  const greeting = nickname ? `${nickname}님 ` : '';
  const title = nearbySpotCount
    ? `${greeting}근처에\n흐릿한 자리 ${nearbySpotCount}곳이 있어요`
    : `${greeting}근처의\n흐릿한 자리를 찾아볼게요`;

  // 값은 조각(해시태그 하나, 걷는 때 하나)으로 나눠 둔다. 길면 조각 사이에서 줄이 바뀐다
  const rows = [
    { label: '나와 대구·경북', pieces: [relationTitle] },
    { label: '끌리는 자리', pieces: placeNames.length > 0 ? placeNames : ['-'] },
    { label: '걷는 때', pieces: walkItems.length > 0 ? withDots(walkItems) : ['-'] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.illustration}>
          <BlurPhoto size={126} style={styles.backPhoto} />
          <BlurPhoto size={136} highlighted style={styles.frontPhoto} />
        </View>

        <View style={styles.texts}>
          <AppText variant="heading01" style={styles.center}>
            {title}
          </AppText>
          <AppText variant="subtitle03" color="textSecondary" style={styles.center}>
            고른 취향에 맞는 자리부터 먼저 띄워둘게요
          </AppText>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.rows}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <AppText variant="caption02" color="textTertiary">
                {row.label}
              </AppText>
              {/* Figma 디자인 수정: 값이 길면 자르지 않고 오른쪽에 맞춘 채 다음 줄로 넘긴다 */}
              <View style={styles.value}>
                {row.pieces.map((piece, index) => (
                  <AppText key={`${piece}-${index}`} variant="subtitle04">
                    {piece}
                  </AppText>
                ))}
              </View>
            </View>
          ))}
        </View>
        <AppText variant="caption04" color="textDeactivated">
          {'마이 > 사용자 기호 수정에서 언제든 바꿀 수 있어요'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: sectionGap,
  },
  top: {
    alignItems: 'center',
    gap: spacing.xxl,
  },
  // 사진 두 장을 서로 반대로 기울여 겹친다 (Figma -12°, +12°)
  illustration: {
    width: 251,
    height: 162,
  },
  backPhoto: {
    position: 'absolute',
    left: 12,
    top: 18,
    transform: [{ rotate: '-12deg' }],
  },
  frontPhoto: {
    position: 'absolute',
    left: 102,
    top: 13,
    transform: [{ rotate: '12deg' }],
  },
  texts: {
    gap: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  summary: {
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.background02,
    gap: spacing.md,
  },
  rows: {
    gap: spacing.xs,
  },
  // 값이 여러 줄이 되어도 이름은 첫 줄 높이에 둔다 (Figma)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  // Figma: 조각 사이 4, 줄 사이 4, 오른쪽 맞춤
  value: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xxs,
  },
});

/** 걷는 때 조각 사이에 '·'를 따로 끼운다. 줄이 바뀌어도 점이 앞 조각에 붙어 있게 (Figma: 조각과 점이 따로 있음) */
function withDots(items: string[]) {
  return items.flatMap((item, index) => (index === 0 ? [item] : ['·', item]));
}
